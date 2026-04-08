import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GithubFile } from "../github/fetcher";

//   Takes an array of raw GitHub files and breaks them into smaller, AI-digestible chunks while keeping track of where they came from.

export async function chunkFiles(files: GithubFile[], repoUrl: string) {
  // Configuring the Splitter

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, // Max tokens per chunk (1000 is a safe size for 4GB VRAM)
    chunkOverlap: 200, // Overlap between chunks to maintain context
  });

  const rawDocuments = files.map((file) => ({
    pageContent: file.content,
    metadata: { source: file.path, repoUrl: repoUrl },
    createdAt: new Date(),
  }));

  // Execute the Split
  console.log(`Splitting ${files.length} files...`);
  const chunks = await splitter.splitDocuments(rawDocuments); // Breaks down raw files into smaller chunks with metadata about their source and creates an array of chunk objects

  console.log(`Created ${chunks.length} chunks!`);
  return chunks;
}
