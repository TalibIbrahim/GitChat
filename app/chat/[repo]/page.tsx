"use client";

import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPage() {
  const params = useParams();
  const repoName = params.repo as string;

  const [fullRepoUrl, setFullRepoUrl] = useState("");
  // 1. Manually manage the input state as per v6 standards
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const storedUrl = sessionStorage.getItem("currentRepoUrl");
    if (storedUrl) {
      setFullRepoUrl(storedUrl);
    }
  }, []);

  // 2. Initialize the pure v6 useChat hook (no config object needed here!)
  const { messages, sendMessage, status } = useChat();

  const isThinking = status === "submitted" || status === "streaming";

  // 3. Custom submit handler utilizing the new sendMessage method
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    // We pass our repoUrl cleanly into the ChatRequestOptions!
    sendMessage({ text: inputValue }, { body: { repoUrl: fullRepoUrl } });

    setInputValue("");
  };

  return (
    <div className="flex h-screen w-full bg-neutral-950 text-white">
      {/* SIDEBAR PLACEHOLDER */}
      <div className="w-64 border-r border-neutral-800 hidden md:block">
        {/* Empty for now */}
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative">
        <header className="p-4 border-b border-neutral-800 flex items-center justify-center">
          <span className="text-neutral-400 text-sm">
            Chatting with: <strong className="text-white">{repoName}</strong>
          </span>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                  m.role === "user" ? "bg-neutral-800" : "bg-transparent"
                }`}
              >
                {/* 4. Render using the new v6 parts array */}
                {m.parts.map((part, i) => {
                  if (part.type === "text") {
                    return m.role === "user" ? (
                      <p key={i} className="whitespace-pre-wrap">
                        {part.text}
                      </p>
                    ) : (
                      // 1. Wrap ReactMarkdown in a div that holds the Tailwind classes
                      <div key={i} className="prose prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          // 2. We removed the className prop from here!
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
                                <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl overflow-hidden my-4 shadow-md">
                                  <div className="bg-neutral-900/50 px-4 py-2 border-b border-neutral-800 text-xs text-neutral-400 font-mono flex justify-between">
                                    <span>{match[1]}</span>
                                  </div>
                                  <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </div>
                                </div>
                              ) : (
                                <code
                                  className="bg-neutral-800 px-1.5 py-0.5 rounded-md text-sm font-mono text-blue-300"
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
            <div className="text-neutral-500 text-sm animate-pulse px-4">
              GitChat AI is thinking...
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 bg-neutral-950 max-w-3xl mx-auto w-full">
          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center"
          >
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message Local RepoChat..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-full px-4 py-4 pr-12 outline-none focus:border-neutral-700 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              className="absolute right-3 p-2 bg-neutral-800 rounded-full disabled:opacity-50 transition-opacity cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
