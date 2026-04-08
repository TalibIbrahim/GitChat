function isValidGitHubRepo(input: string): boolean {
  try {
    if (!input.startsWith("http")) input = "https://" + input;

    const u = new URL(input);
    return (
      u.hostname === "github.com" &&
      u.pathname.split("/").filter(Boolean).length === 2
    );
  } catch {
    return false;
  }
}

export default isValidGitHubRepo;
