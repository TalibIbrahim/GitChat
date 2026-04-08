# GitChat - A Local Codebase RAG 

A locally-run Retrieval-Augmented Generation (RAG) application that allows you to chat directly with your codebase. Built with Next.js, LangChain, and MongoDB Vector Search, this tool keeps your code private by leveraging local AI models to understand and answer questions about your repository.

## Features

- **Local First:** All embeddings and LLM generations are processed locally.
- **Intelligent Code Chat:** Ask complex questions about architecture, find specific functions, or understand legacy code using conversational AI.
- **Fast Vector Retrieval:** Powered by MongoDB Atlas Vector Search for highly accurate and contextual code snippet retrieval.
- **Modern Tech Stack:** Built on Next.js (App Router) and LangChain for a seamless, responsive developer experience.

## Prerequisites

Before you begin, ensure you have the following installed and set up:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) (Optional, for containerized deployment)
- [Ollama](https://ollama.ai/) (Or your preferred local AI runner)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (Free tier works perfectly)

## Database Setup (MongoDB Atlas)

To enable codebase semantic search, you must create a Vector Search Index in your MongoDB cluster.

1. Navigate to your MongoDB Atlas dashboard.
2. Go to your cluster, select the **Atlas Search** tab, and click **Create Search Index**.
3. Choose the **JSON Editor** configuration method.
4. Select your target database and collection, and paste the following **exact JSON configuration**:

```json
{
  "fields": [
    {
      "numDimensions": 768,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    },
    {
      "path": "repoUrl",
      "type": "filter"
    }
  ]
}
```
*Note: Ensure the `numDimensions` matches the output size of your chosen local embedding model.*

## Environment Variables

Create a `.env.local` file in the root directory of your project and configure the necessary credentials. Use the following template:

```env
# MongoDB Configuration
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB_NAME="codechat_db"
MONGODB_COLLECTION_NAME="code_embeddings"

# Local AI Configuration (e.g., Ollama)
OLLAMA_BASE_URL="http://127.0.0.1:11434"
EMBEDDING_MODEL_NAME="nomic-embed-text" # Should match 768 dimensions
LLM_MODEL_NAME="llama3"

# Next.js App configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Local Model Setup

This application relies on local AI models for both embedding the code and generating responses. We use [Ollama](https://ollama.ai/).

1. Open your terminal and start Ollama.
2. Pull the embedding model (e.g., `nomic-embed-text` for 768 dimensions):
   ```bash
   ollama pull nomic-embed-text
   ```
3. Pull the generation model (e.g., `llama3` or `qwen3`):
   ```bash
   ollama pull llama3
   ```
4. Ensure the Ollama service is running in the background before starting the app.

## App Configuration (Models & Prompts)

Beyond the environment variables, the application requires some manual configuration to tune the RAG pipeline. You will need to edit the following specific files in the repository:

- **`lib/vectorstore.ts` - Configure Retrieval:**
  - **`k` (Retrieval Limit):** Edit the `k` value in the retriever initialization. This dictates how many vector database documents (code chunks) are retrieved and passed to the AI as context. A higher `k` provides more context but consumes more of the LLM's context window.

- **`app/api/chat/route.ts` - Configure LLM & Prompts:**
  - **`temperature`:** Edit the `temperature` parameter in the Chat Model initialization. For querying a codebase, a lower temperature (e.g., `0.2` to `0.4`) is recommended to ensure factual, deterministic answers rather than creative ones.
  - **`prompt` (System Prompt):** Modify the `PromptTemplate` string to customize the AI's persona, instruct it on how to format code blocks, or tell it how strictly it should adhere to the retrieved context.

## Installation & Running

This project is about 70% plug-and-play. Once your database and local models are set up, you can run the application using standard Node.js commands.

### Standard Node.js Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to start chatting with your codebase!

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.