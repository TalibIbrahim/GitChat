import { ChatOllama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";

export const getLLM = (modelName: string, temperature: number) => {
  return new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: modelName,
    temperature: temperature,
    numCtx: 8192,
  });
};
export const getEmbeddings = () => {
  return new OllamaEmbeddings({
    baseUrl: "http://localhost:11434",
    model: "nomic-embed-text",
  });
};
