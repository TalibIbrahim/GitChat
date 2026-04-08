import { PromptTemplate } from "@langchain/core/prompts";

// This will define the behavior of our RAG system. The prompt sent to the LLM is basically: Prompt Template + User Prompt + Context from the Vector Store Retriever.

// inside prompt.ts
const template = `You are a strict, expert software developer assistant.

<context>
{context}
</context>

<chat_history>
{chat_history}
</chat_history>

<question>
{question}
</question>

// CRITICAL INSTRUCTIONS:
// 1. If the question asks about the codebase, answer using ONLY the code provided in the <context> block.
// 2. If the question asks to explain or modify code that YOU just generated in the <chat_history>, you may do so.
// 3. If the answer is not in the <context> AND not related to the <chat_history>, reply exactly with: "I cannot find the answer to this in the provided codebase context." Do not guess.

Answer:`;

export const ragPrompt = new PromptTemplate({
  template: template,
  inputVariables: ["context", "chat_history", "question"], // requirements for the prompt template
});
