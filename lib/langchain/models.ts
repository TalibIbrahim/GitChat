import { ChatOllama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";

export const getLLM = () => {
  return new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "qwen2.5-coder:3b",
    temperature: 0.2,
    numCtx: 8192, // Forces Ollama to use more VRAM to read up to 8k tokens at once
  });
};

export const getEmbeddings = () => {
  return new OllamaEmbeddings({
    baseUrl: "http://localhost:11434",
    model: "nomic-embed-text",
  });
};
