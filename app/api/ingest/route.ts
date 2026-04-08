import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";

// Fetching and Chunking Logic
import { fetchGithubRepo } from "@/lib/github/fetcher";
import { chunkFiles } from "@/lib/langchain/splitter";
import { getEmbeddings } from "@/lib/langchain/models";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { repoUrl } = body; // extract the repo URL from the request body by destructuring

    const files = await fetchGithubRepo(repoUrl); // Fetch the github repo
    const chunks = await chunkFiles(files, repoUrl); // Chunk the files

    const client = await clientPromise; // Connect to MongoDB Atlas
    const db = client.db("github_rag");
    const collection = db.collection("code_chunks");

    // Automatic expiration of documents after 24 hours (86400 seconds)
    await collection.createIndex(
      { "metadata.createdAt": 1 },
      { expireAfterSeconds: 86400 },
    );

    console.log(`Embedding ${chunks.length} chunks and saving to MongoDB...`);

    // .fromDocuments automatically batches the chunks, sends them to Ollama using our getEmbeddings function to generate the vectors, and saves everything to MongoDB in one step
    await MongoDBAtlasVectorSearch.fromDocuments(chunks, getEmbeddings(), {
      collection: collection as any, // Type assertion to bypass type issues with the MongoDB collection
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    });

    console.log("Ingestion complete");

    return NextResponse.json({
      success: true,
      message: `Successfully embedded and saved ${chunks.length} chunks to the database!`,
    });
  } catch (error: any) {
    console.error("Ingestion Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
