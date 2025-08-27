// theidealprogen/src/lib/github.ts
import { Octokit } from "@octokit/rest";

const GITHUB_ORG = process.env.GITHUB_ORG!;
const TOKEN = process.env.GITHUB_AUTH_TOKEN!;

function b64(s: string) {
  if (typeof Buffer !== "undefined") return Buffer.from(s).toString("base64");
  // @ts-ignore
  return (globalThis as any).btoa(unescape(encodeURIComponent(s)));
}

export function octokit() {
  if (!GITHUB_ORG || !TOKEN) throw new Error("GitHub env missing (GITHUB_ORG/GITHUB_AUTH_TOKEN).");
  return new Octokit({ auth: TOKEN });
}

export async function createPagesRepoAndPublish(opts: {
  repoName: string;
  files: Record<string, string>;
}) {
  const { repoName, files } = opts;
  const client = octokit();

  // 1) create (idempotent)
  let repo;
  try {
    const res = await client.repos.createInOrg({
      org: GITHUB_ORG, name: repoName, private: false, auto_init: true,
      description: "Published with TheIdealProGen"
    });
    repo = res.data;
  } catch (e: any) {
    if (e?.status === 422) repo = (await client.repos.get({ owner: GITHUB_ORG, repo: repoName })).data;
    else throw e;
  }

  const owner = GITHUB_ORG;
  const branch = repo.default_branch || "main";

  // 2) upload files
  for (const [path, content] of Object.entries(files)) {
    await client.repos.createOrUpdateFileContents({
      owner, repo: repo.name, path,
      message: `publish ${path}`, content: b64(content), branch
    });
  }

  // 3) enable pages
  try {
    await client.request("POST /repos/{owner}/{repo}/pages", { owner, repo: repo.name, source: { branch, path: "/" } });
  } catch {
    await client.request("PUT /repos/{owner}/{repo}/pages", { owner, repo: repo.name, source: { branch, path: "/" } });
  }

  const pagesUrl = `https://${owner}.github.io/${repo.name}`;

  // 4) wait live
  await waitFor200(pagesUrl, 12, 5000);

  return { repoName: repo.name, pagesUrl };
}

export async function archiveRepo(repo: string) {
  const client = octokit();
  await client.repos.update({ owner: GITHUB_ORG, repo, archived: true });
}

export async function unarchiveRepo(repo: string) {
  const client = octokit();
  await client.repos.update({ owner: GITHUB_ORG, repo, archived: false });
}

export async function deleteRepo(repo: string) {
  const client = octokit();
  // requires PAT with delete_repo permission
  await client.repos.delete({ owner: GITHUB_ORG, repo });
}

async function waitFor200(url: string, attempts: number, ms: number) {
  for (let i = 0; i < attempts; i++) {
    const ok = await head(url);
    if (ok) return;
    await new Promise((r) => setTimeout(r, ms));
  }
}
async function head(url: string) {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch { return false; }
}
