import { exec } from "child_process"; // This allows  JavaScript code to invisibly open a terminal and run command-line scripts (like git clone)
import { promisify } from "util";
import fs from "fs/promises"; // This lets the app create folders, read text files, and delete things off the actual hard drive
import path from "path";
import os from "os";
//Utilities to figure out where the computer's temporary folders are and how to format file paths

const execAsync = promisify(exec); // asynchronously runs command-line scripts and waits for them to finish

// Directories and file types to skip to save DB space and VRAM
const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  "public",
]);
const IGNORED_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".mp4",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".lock",
  ".woff",
  ".woff2",
  ".ttf",
]);

export interface GithubFile {
  path: string;
  content: string;
} // Our file structure, used to store the path and content of each file we read from the cloned repository.

// Recursively reads a directory and returns an array of file contents
async function getFilesRecursively(
  dir: string,
  baseDir: string,
): Promise<GithubFile[]> {
  let results: GithubFile[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      // Recursively fetch files in subdirectories
      const subFiles = await getFilesRecursively(fullPath, baseDir);
      results = results.concat(subFiles);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (IGNORED_EXTS.has(ext)) continue;

      try {
        const content = await fs.readFile(fullPath, "utf-8");
        results.push({
          path: relativePath,
          content,
        });
      } catch (error) {
        console.warn(`Could not read file: ${relativePath}`, error);
      }
    }
  }
  return results;
}

// Clones a public GitHub repo to a temporary directory, extracts the code, and cleans up.
export async function fetchGithubRepo(repoUrl: string): Promise<GithubFile[]> {
  // Create a unique temporary directory
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "github-rag-"));
  // creates a hidden temporary folder in the system's temp directory, with a random suffix to avoid collisions with other instances of the app running at the same time

  try {
    console.log(`Cloning ${repoUrl} into ${tempDir}...`);
    // --depth 1 clones only the latest commit (tells github to fetch the code as it is now)
    await execAsync(`git clone --depth 1 ${repoUrl} ${tempDir}`);

    console.log("Reading files...");
    const files = await getFilesRecursively(tempDir, tempDir);

    return files;
  } catch (error) {
    console.error("Error fetching repository:", error);
    throw new Error(
      "Failed to fetch repository. Make sure the URL is valid and public.",
    );
  } finally {
    // ALWAYS clean up the temporary directory to avoid filling up your hard drive
    console.log(`Cleaning up ${tempDir}...`);
    await fs.rm(tempDir, { recursive: true, force: true }); // remove the temp dir
  }
}
