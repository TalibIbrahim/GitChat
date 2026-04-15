"use client";

import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaGithub } from "react-icons/fa"; // Imported GitHub icon

export default function ChatPage() {
  const params = useParams();
  const repoName = params.repo as string;

  const [fullRepoUrl, setFullRepoUrl] = useState("");
  const [inputValue, setInputValue] = useState("");

  const [temperature, setTemperature] = useState<number>(0.4);
  const [kValue, setKValue] = useState<number>(10);
  const [model, setModel] = useState<string>("qwen2.5-coder:3b");

  useEffect(() => {
    const storedUrl = sessionStorage.getItem("currentRepoUrl");
    if (storedUrl) {
      setFullRepoUrl(storedUrl);
    }
  }, []);

  const { messages, sendMessage, status } = useChat();

  const isThinking = status === "submitted" || status === "streaming";

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    sendMessage(
      { text: inputValue },
      {
        body: {
          repoUrl: fullRepoUrl,
          temperature,
          kValue,
          model,
        },
      },
    );

    setInputValue("");
  };

  return (
    <div className="flex h-screen w-full bg-neutral-950 text-neutral-200 font-sans selection:bg-neutral-700 selection:text-white">
      {/* Sidebar */}
      <div className="w-72 border-r border-neutral-800 hidden md:flex flex-col bg-neutral-900">
        <div className="p-6 pb-4 border-b border-neutral-800">
          <h1 className="text-lg font-medium text-neutral-100 tracking-tight flex items-center gap-2">
            GitChat AI
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Local LLM Mode</p>
        </div>

        <div className="p-6 flex flex-col flex-1 overflow-y-auto">
          <h2 className="text-[10px] font-bold tracking-widest text-neutral-500 mb-5 uppercase">
            Model Settings
          </h2>

          {/* Model Selection */}
          <div className="mb-6 flex flex-col gap-2.5">
            <label className="text-xs font-medium text-neutral-400">
              Local Model
            </label>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2.5 text-sm outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 appearance-none transition-all text-neutral-200 cursor-pointer"
              >
                <option value="qwen2.5-coder:3b">Qwen 2.5 Coder (3B)</option>
                <option value="llama3:8b">Llama 3 (8B)</option>
                <option value="mistral">Mistral (7B)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <label className="text-xs font-medium text-neutral-400">
                Temperature
              </label>
              <span className="text-xs text-neutral-400 font-mono">
                {temperature}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-400"
            />
          </div>

          {/* K-Value Slider */}
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <label className="text-xs font-medium text-neutral-400">
                Context Chunks (k)
              </label>
              <span className="text-xs text-neutral-400 font-mono">
                {kValue}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={kValue}
              onChange={(e) => setKValue(parseInt(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-400"
            />
          </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative bg-neutral-950">
        <header className="px-6 py-4 border-b border-neutral-800 flex items-center backdrop-blur-md sticky top-0 z-10 bg-neutral-950/80">
          <span className="text-neutral-400 text-sm">
            Chatting with:{" "}
            <strong className="text-neutral-100 font-medium">{repoName}</strong>
          </span>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
          {/* Empty State / Welcome Message */}
          {messages.length === 0 && (
            <div className="flex items-start gap-4 animate-in fade-in duration-500">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 shrink-0">
                <FaGithub className="w-4 h-4" />
              </div>
              <p className="text-neutral-300 leading-relaxed text-sm mt-1 max-w-2xl">
                Hello! I've successfully processed the repository{" "}
                <strong className="text-neutral-100">{repoName}</strong>. The
                code has been chunked and vectorized locally. What would you
                like to know about it?
              </p>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] px-5 py-4 ${
                  m.role === "user"
                    ? "bg-neutral-800 border border-neutral-700 rounded-2xl rounded-tr-sm shadow-sm"
                    : "bg-transparent rounded-2xl px-0"
                }`}
              >
                {/* AI Identifier */}
                {m.role !== "user" && (
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200">
                      <FaGithub className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      GitChat
                    </span>
                  </div>
                )}

                {m.parts.map((part, i) => {
                  if (part.type === "text") {
                    return m.role === "user" ? (
                      <p
                        key={i}
                        className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-100"
                      >
                        {part.text}
                      </p>
                    ) : (
                      <div
                        key={i}
                        className="prose prose-invert prose-sm max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-p:leading-relaxed prose-p:text-neutral-300 ml-10"
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }: any) {
                              const match = /language-(\w+)/.exec(
                                className || "",
                              );
                              return !inline && match ? (
                                <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden my-5 shadow-sm">
                                  <div className="bg-neutral-950 px-4 py-2 border-b border-neutral-800 text-xs text-neutral-400 font-mono flex justify-between items-center">
                                    <span>{match[1]}</span>
                                  </div>
                                  <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-loose">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </div>
                                </div>
                              ) : (
                                <code
                                  className="bg-neutral-800 px-1.5 py-0.5 rounded text-[13px] font-mono text-neutral-200 border border-neutral-700"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {part.text}
                        </ReactMarkdown>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200">
                  <FaGithub className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="text-neutral-400 text-sm flex gap-1 items-center font-mono">
                  Thinking<span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 md:p-6 bg-linear-to-t from-neutral-950 via-neutral-950 to-transparent max-w-4xl mx-auto w-full">
          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center shadow-lg"
          >
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask GitChat..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 pr-14 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              className="absolute right-2 p-2.5 bg-neutral-200 text-neutral-900 hover:bg-white rounded-lg disabled:opacity-20 disabled:bg-neutral-700 disabled:text-neutral-400 transition-all cursor-pointer flex items-center justify-center group"
            >
              <svg
                className="w-4 h-4 transform group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19V5m0 0l-7 7m7-7l7 7"
                ></path>
              </svg>
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[10px] text-neutral-500">
              GitChat AI can make mistakes. Verify information with the source
              code.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
