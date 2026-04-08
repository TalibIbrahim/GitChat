import { PromptTemplate } from "@langchain/core/prompts";

// This will define the behavior of our RAG system. The prompt sent to the LLM is basically: Prompt Template + User Prompt + Context from the Vector Store Retriever.

// inside prompt.ts
const template = `You are an expert software developer answering questions about a specific codebase. 

Here is the retrieved code context:
---------------------
{context}
---------------------

User Question: {question}

CRITICAL INSTRUCTION: You must answer the User Question using ONLY the provided code context above. 
If the answer or code is not explicitly present in the context, DO NOT GUESS or write generic code. Simply reply exactly with: "I cannot find the answer to this in the provided codebase context."

Helpful Answer:`;

export const ragPrompt = new PromptTemplate({
  template: template,
  inputVariables: ["context", "question"], // requirements for the prompt template
});
