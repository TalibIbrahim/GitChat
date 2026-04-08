"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiGithub, FiArrowRight } from "react-icons/fi";
import { SiGooglegemini } from "react-icons/si";
import isValidGitHubRepo from "@/Utils/validRepo";

import { Oval } from "react-loader-spinner";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  const router = useRouter();

  useEffect(() => {
    if (!isLoading) return;

    const messages = [
      "Cloning repository from GitHub...",
      "Scanning and reading codebase...",
      "Chunking files for the AI...",
      "Generating local embeddings (this takes a moment)...",
      "Uploading vectors to MongoDB Atlas...",
      "Almost there, finalizing data...",
    ];

    let i = 0;
    setLoadingMessage(messages[0]); // start immediately

    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMessage(messages[i]);
    }, 8000); // Changes the message every 8 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!isValidGitHubRepo(repoUrl)) {
      setIsLoading(false);
      alert("Please enter a valid GitHub repository URL.");
      return;
    }

    try {
      const urlObj = new URL(
        repoUrl.startsWith("http") ? repoUrl : "https://" + repoUrl,
      );

      const [owner, repo] = urlObj.pathname.split("/").filter(Boolean);
      console.log(`Repo Owner: ${owner}, Repo Name: ${repo}`);

      const githubCheck = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
      );
      if (!githubCheck.ok) {
        throw new Error("Repository not found or is private.");
      }

      const ingestRes = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      if (!ingestRes.ok) {
        const errorData = await ingestRes.json();
        throw new Error(errorData.error || "Failed to ingest repository.");
      }

      sessionStorage.setItem("currentRepoUrl", repoUrl);
      router.push(`/chat/${repo}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans flex-col selection:bg-neutral-700">
      <nav className="sticky top-0 z-50 flex flex-row justify-between items-center px-6 py-4 w-full bg-[#141414] shadow-md">
        <div className="logo-section flex items-center space-x-3 selection:bg-neutral-800">
          <div className="bg-neutral-50 w-8 h-8 rounded-lg flex items-center justify-center">
            <FiGithub className="text-black w-5 h-5" />
          </div>
          <span className="font-semibold text-xl tracking-tight">
            GitChat AI
          </span>
        </div>
        <div className="flex items-center justify-center">
          <a
            href="https://github.com/TalibIbrahim/GitChat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-50 hover:text-gray-300 transition-colors duration-200"
          >
            Documentation
          </a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto -mt-28">
        <div className="mb-8 relative flex items-center justify-center  cursor-default ">
          <div className="absolute inset-0 m-auto bg-blue-500/15 blur-[50px] rounded-full w-28 h-28 opacity-70 transition-opacity duration-700 " />
          <div className="relative w-20 h-20 rounded-3xl bg-blue-950/30 border border-blue-900/20 flex items-center justify-center shadow-[0_16px_32px_-12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden transition-transform duration-500 ">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_90%)]" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />
            <SiGooglegemini className="w-9 h-9 text-white relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform duration-700 ease-out " />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-center mb-4">
          Talk to your codebase
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl text-center max-w-2xl mb-12">
          Paste any public GitHub repository link below to start exploring,
          summarizing, and querying the code using an intelligent local LLM.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl relative flex items-center bg-neutral-900 border border-neutral-800 rounded-3xl p-2 pl-6 focus-within:ring-2 focus-within:ring-white/40 focus-within:border-white/20 transition-all shadow-2xl"
        >
          <FiGithub className="text-neutral-400 w-5 h-5 shrink-0 pointer-events-none" />
          <input
            type="url"
            required
            placeholder="https://github.com/langchain-ai/langchain"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-4 text-lg placeholder:text-neutral-600 w-full"
          />
          <button
            type="submit"
            className="bg-neutral-200 cursor-pointer text-neutral-950 rounded-2xl w-12 h-12 text-2xl flex items-center justify-center"
          >
            {isLoading ? (
              <Oval
                visible={true}
                height="30"
                width="30"
                color="#111111"
                secondaryColor="#000000"
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                strokeWidth={2.5}
                wrapperClass=""
              />
            ) : (
              <FiArrowRight />
            )}
          </button>
        </form>

        <div
          className={`mt-4 text-sm text-neutral-200 transition-opacity duration-500 ${
            isLoading ? "opacity-100" : "opacity-0"
          }`}
        >
          {loadingMessage}
        </div>
      </main>
    </div>
  );
}
