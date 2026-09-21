import process from "node:process";

for (const key of Object.keys(process.env)) {
  if (
    key.includes("DATABASE") ||
    key.includes("GIT_PROVIDER") ||
    key.includes("GIT_REPO_OWNER") ||
    key.includes("GIT_REPO_SLUG") ||
    key === "VERCEL" ||
    key === "VERCEL_ENV"
  ) {
    const v = process.env[key] ?? "";
    console.log(
      `[envcheck] ${key}=${v.length > 80 ? v.slice(0, 80) + `...len=${v.length}` : v || "<EMPTY> or <unset>"}`,
    );
  }
}