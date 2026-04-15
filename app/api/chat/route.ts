import { StringOutputParser } from "@langchain/core/output_parsers"; // Output parser to ensure we get a clean string response from the LLM (removes extra useless data)
import { ragPrompt } from "@/lib/langchain/prompt";
import { getVectorStoreRetriever } from "@/lib/langchain/vectorstore";
import { getLLM } from "@/lib/langchain/models";

import { toUIMessageStream, toBaseMessages } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 2. Extract messages, repoUrl, kValue, Temperature, model sent by your frontend
    const {
      messages,
      repoUrl,
      temperature = 0.4,
      kValue = 10,
      model = "qwen2.5-coder:3b",
    } = body;

    console.log(
      `\n [RAG Config] Model: ${model} | Temp: ${temperature} | K: ${kValue}\n`,
    );

    if (!repoUrl) {
      return new Response(
        JSON.stringify({ error: "No repository URL provided" }),
        { status: 400 },
      );
    }

    // Let the Vercel adapter safely convert the UIMessage[] into LangChain format
    const langchainMessages = await toBaseMessages(messages);

    // 3. Extract the text safely from the converted LangChain message
    const lastMessage = langchainMessages[langchainMessages.length - 1];
    const latestMessageText = lastMessage.content as string;

    const historyMessages = langchainMessages.slice(0, -1);
    const chatHistoryText = historyMessages
      .map((m) => `${m._getType() === "human" ? "User" : "AI"}: ${m.content}`)
      .join("\n\n");

    const retriever = await getVectorStoreRetriever(repoUrl, kValue);
    const docs = await retriever.invoke(latestMessageText);

    // Combine the top 4 chunks into one giant string of text
    const contextText = docs
      .map((doc) => `File: ${doc.metadata.source}\n${doc.pageContent}`)
      .join("\n\n---\n\n");

    // building the Chain (Prompt -> LLM )
    const llm = getLLM(model, temperature); // Ollama LLM connection (from models.ts)
    const chain = ragPrompt.pipe(llm);

    // 5. Generate the stream
    const stream = await chain.stream({
      context: contextText,
      chat_history: chatHistoryText || "No previous history.", // Pass the chat history text to the prompt
      question: latestMessageText, // Pass the extracted text here too
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream(stream),
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
