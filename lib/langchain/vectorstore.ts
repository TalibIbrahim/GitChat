import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { getEmbeddings } from "./models";
import clientPromise from "@/lib/mongodb";

export async function getVectorStoreRetriever(repoUrl: string) {
  // wait for the MongoDB client to connect and get the database & collection
  const client = await clientPromise;
  const db = client.db("github_rag");
  const collection = db.collection("code_chunks");

  // initialize the Vector Store connection
  const vectorStore = new MongoDBAtlasVectorSearch(getEmbeddings(), {
    collection: collection as any, // bypass for the MongoDB driver
    indexName: "vector_index", // name of the vector index in MongoDB Atlas
    textKey: "text",
    embeddingKey: "embedding",
  });

  // asRetriever is a built in method in Langchain. It wraps the mongodb search into a universal Langchain retriever interface that we can use in our RAG.
  return vectorStore.asRetriever({
    k: 10, // return the top 'k' most relevant chunks. (adjust based on hardware capabilities and latency requirements)
    // A filter to only search chunks matching the repoUrl
    filter: {
      preFilter: {
        repoUrl: { $eq: repoUrl },
      },
    },
  });
}
