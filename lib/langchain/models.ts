import { ChatOllama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";

export const getLLM = () => {
  return new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "qwen2.5-coder:1.5b",
    temperature: 0.2,
  });
};

export const getEmbeddings = () => {
  return new OllamaEmbeddings({
    baseUrl: "http://localhost:11434",
    model: "nomic-embed-text",
  });
};
