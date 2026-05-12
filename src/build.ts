import { readFile, readdir, writeFile, mkdir, rm, cp, access } from "node:fs/promises";
import { join, dirname, basename, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";
import { Feed } from "feed";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const POSTS_DIR = join(ROOT, "posts");
const PAGES_DIR = join(ROOT, "pages");
const PUBLIC_DIR = join(ROOT, "public");
const TEMPLATES_DIR = join(__dirname, "templates");
const DIST_DIR = join(ROOT, "dist");

const RAW_SITE_URL = process.env.SITE_URL ?? "http://localhost:8000/";
const SITE_URL = RAW_SITE_URL.endsWith("/") ? RAW_SITE_URL : `${RAW_SITE_URL}/`;
const SITE_TITLE = "Beerss";
const SITE_DESCRIPTION = "Olutkerhon maistelut, tapahtumat ja kuulumiset.";
const SITE_LANGUAGE = "fi";
const GITHUB_URL = process.env.GITHUB_URL ?? "https://github.com/olutkerhory/olutkerhory.github.io";
const FEED_URL = `${SITE_URL}rss.xml`;

marked.setOptions({ gfm: true });

type Post = {
  slug: string;
  title: string;
  date: Date;
  description: string;
  eventDate?: Date;
  eventLocation?: string;
  tags: string[];
  bodyHtml: string;
  url: string;
};

type Page = {
  slug: string;
  title: string;
  bodyHtml: string;
};

const dateFmt = new Intl.DateTimeFormat("fi-FI", { day: "numeric", month: "long", year: "numeric" });

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const toDate = (v: unknown, field: string, file: string): Date => {
  if (v instanceof Date) return v;
  if (typeof v === "string") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  throw new Error(`${file}: invalid or missing "${field}" frontmatter (got ${JSON.stringify(v)})`);
};

const exists = async (p: string): Promise<boolean> => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

async function loadPosts(): Promise<Post[]> {
  if (!(await exists(POSTS_DIR))) return [];
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  const posts: Post[] = [];
  for (const file of files) {
    const fullPath = join(POSTS_DIR, file);
    const raw = await readFile(fullPath, "utf8");
    const { data, content } = matter(raw);
    const slug = basename(file, extname(file));
    if (typeof data.title !== "string" || !data.title) throw new Error(`${file}: missing "title"`);
    if (typeof data.description !== "string" || !data.description)
      throw new Error(`${file}: missing "description"`);
    posts.push({
      slug,
      title: data.title,
      date: toDate(data.date, "date", file),
      description: data.description,
      eventDate: data.eventDate ? toDate(data.eventDate, "eventDate", file) : undefined,
      eventLocation: typeof data.eventLocation === "string" ? data.eventLocation : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      bodyHtml: await marked.parse(content),
      url: `${SITE_URL}posts/${slug}.html`,
    });
  }
  posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  return posts;
}

async function loadPages(): Promise<Page[]> {
  if (!(await exists(PAGES_DIR))) return [];
  const files = (await readdir(PAGES_DIR)).filter((f) => f.endsWith(".md"));
  const pages: Page[] = [];
  for (const file of files) {
    const raw = await readFile(join(PAGES_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const slug = basename(file, extname(file));
    if (typeof data.title !== "string" || !data.title) throw new Error(`${file}: missing "title"`);
    // Substitute site/feed URLs in raw markdown so they end up resolved in code blocks and links alike.
    const substituted = content
      .replace(/\{\{siteUrl\}\}/g, SITE_URL)
      .replace(/\{\{feedUrl\}\}/g, FEED_URL);
    pages.push({ slug, title: data.title, bodyHtml: await marked.parse(substituted) });
  }
  return pages;
}

const fill = (tpl: string, vars: Record<string, string>): string =>
  tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k]! : ""));

function renderEventMeta(post: Post): string {
  if (!post.eventDate && !post.eventLocation) return "";
  const parts: string[] = [];
  if (post.eventDate) {
    parts.push(
      `tapahtuma <time datetime="${post.eventDate.toISOString()}">${escapeHtml(dateFmt.format(post.eventDate))}</time>`,
    );
  }
  if (post.eventLocation) parts.push(escapeHtml(post.eventLocation));
  return ` · ${parts.join(" · ")}`;
}

function renderPostListItem(post: Post): string {
  const event = renderEventMeta(post);
  return `<li class="post-list-item">
    <a class="post-list-link" href="${escapeHtml(post.url)}">
      <span class="post-list-title">${escapeHtml(post.title)}</span>
      <span class="post-list-meta">
        <time datetime="${post.date.toISOString()}">${escapeHtml(dateFmt.format(post.date))}</time>${event}
      </span>
      <span class="post-list-desc">${escapeHtml(post.description)}</span>
    </a>
  </li>`;
}

async function writePage(outPath: string, html: string): Promise<void> {
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html, "utf8");
}

function buildFeed(posts: Post[]): string {
  const feed = new Feed({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    id: SITE_URL,
    link: SITE_URL,
    language: SITE_LANGUAGE,
    feedLinks: { rss2: `${SITE_URL}rss.xml` },
    copyright: `© ${new Date().getFullYear()} Beerss`,
    updated: posts[0]?.date ?? new Date(),
  });
  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: post.url,
      link: post.url,
      description: post.description,
      content: post.bodyHtml,
      date: post.date,
      category: post.tags.map((name) => ({ name })),
    });
  }
  return feed.rss2();
}

async function main(): Promise<void> {
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR, { recursive: true });

  const [baseTpl, indexTpl, postTpl, pageTpl, posts, pages] = await Promise.all([
    readFile(join(TEMPLATES_DIR, "base.html"), "utf8"),
    readFile(join(TEMPLATES_DIR, "index.html"), "utf8"),
    readFile(join(TEMPLATES_DIR, "post.html"), "utf8"),
    readFile(join(TEMPLATES_DIR, "page.html"), "utf8"),
    loadPosts(),
    loadPages(),
  ]);

  for (const post of posts) {
    const inner = fill(postTpl, {
      postTitle: escapeHtml(post.title),
      postBody: post.bodyHtml,
      date: post.date.toISOString(),
      dateFormatted: escapeHtml(dateFmt.format(post.date)),
      eventMeta: renderEventMeta(post),
      siteUrl: escapeHtml(SITE_URL),
    });
    const html = fill(baseTpl, {
      title: `${escapeHtml(post.title)} — Beerss`,
      content: inner,
      siteUrl: escapeHtml(SITE_URL),
      githubUrl: escapeHtml(GITHUB_URL),
    });
    await writePage(join(DIST_DIR, "posts", `${post.slug}.html`), html);
  }

  const indexInner = fill(indexTpl, {
    posts: posts.map(renderPostListItem).join("\n"),
    siteUrl: escapeHtml(SITE_URL),
  });
  const indexHtml = fill(baseTpl, {
    title: SITE_TITLE,
    content: indexInner,
    siteUrl: escapeHtml(SITE_URL),
    githubUrl: escapeHtml(GITHUB_URL),
  });
  await writePage(join(DIST_DIR, "index.html"), indexHtml);

  for (const page of pages) {
    const inner = fill(pageTpl, {
      pageTitle: escapeHtml(page.title),
      pageBody: page.bodyHtml,
      siteUrl: escapeHtml(SITE_URL),
    });
    const html = fill(baseTpl, {
      title: `${escapeHtml(page.title)} — Beerss`,
      content: inner,
      siteUrl: escapeHtml(SITE_URL),
      githubUrl: escapeHtml(GITHUB_URL),
    });
    await writePage(join(DIST_DIR, `${page.slug}.html`), html);
  }

  await writeFile(join(DIST_DIR, "rss.xml"), buildFeed(posts), "utf8");

  if (await exists(PUBLIC_DIR)) {
    await cp(PUBLIC_DIR, DIST_DIR, { recursive: true });
  }

  console.log(
    `Built ${posts.length} post${posts.length === 1 ? "" : "s"} and ${pages.length} page${
      pages.length === 1 ? "" : "s"
    } → ${DIST_DIR}`,
  );
  console.log(`Site URL: ${SITE_URL}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
