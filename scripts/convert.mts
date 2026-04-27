import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const POSTS_DIR = path.join(REPO_ROOT, 'src', 'content', 'posts');
const PAGES_DIR = path.join(REPO_ROOT, 'src', 'content', 'pages');

// Directories to exclude from post discovery
const EXCLUDE = new Set([
  'about', 'author', 'tag', 'page', 'rss', '404',
  'assets', 'content', 'public', 'cdn-cgi',
  '.git', '.github', '.claude', 'scripts', 'src', 'node_modules', 'dist',
]);

// Absolute URL patterns to rewrite to relative
function rewriteImageUrl(url: string): string {
  if (!url) return url;
  // Convert Ghost absolute URLs to relative
  url = url.replace(/^https?:\/\/twnb\.nbtrisna\.my\.id\/content\/images\//, '/content/images/');
  // Keep external image hosts as-is (img.nbtrisna.my.id, photoby.nbtrisna.my.id, images.unsplash.com)
  return url;
}

function extractMetadata($: cheerio.CheerioAPI): {
  title: string;
  published: Date;
  updated: Date | null;
  tags: string[];
  excerpt: string;
  featuredImage: string | null;
  author: string;
} {
  const title = $('title').first().text().trim();

  const publishedRaw = $('meta[property="article:published_time"]').attr('content');
  const published = publishedRaw ? new Date(publishedRaw) : new Date();

  const modifiedRaw = $('meta[property="article:modified_time"]').attr('content');
  const updated = modifiedRaw ? new Date(modifiedRaw) : null;

  const tags: string[] = [];
  $('meta[property="article:tag"]').each((_, el) => {
    const tag = $(el).attr('content');
    if (tag) tags.push(tag.trim().toLowerCase());
  });

  let excerpt = $('meta[property="og:description"]').attr('content') ||
                $('meta[name="description"]').attr('content') || '';
  // Collapse to single line, truncate to ~200 chars, break at word boundary
  excerpt = excerpt.replace(/\s+/g, ' ').trim();
  if (excerpt.length > 200) {
    excerpt = excerpt.slice(0, 200).replace(/ [^ ]*$/, '') + '...';
  }

  const ogImage = $('meta[property="og:image"]').attr('content');
  const featuredImage = ogImage ? rewriteImageUrl(ogImage) : null;

  // Get author from JSON-LD or meta
  let author = 'I Gusti Ngurah Bagus Trisna Andika';
  const ldJson = $('script[type="application/ld+json"]').html();
  if (ldJson) {
    try {
      const parsed = JSON.parse(ldJson);
      if (parsed.author && parsed.author.name) {
        author = parsed.author.name;
      }
    } catch { /* ignore parse errors */ }
  }

  return { title, published, updated, tags, excerpt: excerpt.slice(0, 300), featuredImage, author };
}

function extractContentHTML($: cheerio.CheerioAPI): string {
  const contentSection = $('section.gh-content').first();
  if (!contentSection.length) return '';

  // Clone to avoid mutating the original
  const section = contentSection.clone();

  // Handle <!--kg-card-begin: html--> / <!--kg-card-end: html--> markers
  // These wrap raw HTML tables - remove the comment markers but keep the HTML inside
  let html = section.html() || '';
  html = html.replace(/<!--kg-card-begin:\s*html-->/g, '');
  html = html.replace(/<!--kg-card-end:\s*html-->/g, '');

  // Rewrite image URLs in the HTML
  html = html.replace(/src="([^"]+)"/g, (_match, url) => {
    // If it's just a filename with no path/URL, prefix with img.nbtrisna.my.id
    if (!url.startsWith('/') && !url.startsWith('http')) {
      return `src="https://img.nbtrisna.my.id/${url}"`;
    }
    const rewritten = rewriteImageUrl(url);
    return `src="${rewritten}"`;
  });

  html = html.replace(/srcset="([^"]+)"/g, (_match, urls) => {
    const rewritten = urls.split(/,\s*/).map((u: string) => {
      const parts = u.trim().split(/\s+/);
      if (!parts[0].startsWith('/') && !parts[0].startsWith('http')) {
        parts[0] = `https://img.nbtrisna.my.id/${parts[0]}`;
      } else {
        parts[0] = rewriteImageUrl(parts[0]);
      }
      return parts.join(' ');
    }).join(', ');
    return `srcset="${rewritten}"`;
  });

  return html;
}

function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function toYAML(value: unknown, indent = ''): string {
  if (value === null || value === undefined) return 'null';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return '\n' + value.map(v => `${indent}  - ${toYAML(v, indent + '    ')}`).join('\n');
  }
  if (typeof value === 'string') {
    // Escape special YAML characters
    const escaped = value.replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  return String(value);
}

function convertPost(postDir: string, slug: string): boolean {
  const indexPath = path.join(postDir, 'index.html');
  if (!fs.existsSync(indexPath)) return false;

  const raw = fs.readFileSync(indexPath, 'utf-8');
  const $ = cheerio.load(raw);

  const meta = extractMetadata($);
  const contentHTML = extractContentHTML($);

  if (!contentHTML.trim()) {
    console.log(`  ⚠  Empty content in ${slug}, skipping`);
    return false;
  }

  // Convert HTML to Markdown
  const turndown = new TurndownService({
    codeBlockStyle: 'fenced',
    headingStyle: 'atx',
    bulletListMarker: '-',
    emDelimiter: '*',
  });

  // Custom rule: remove figure wrapper from kg-image-card, keep img + figcaption
  turndown.addRule('kgImageCard', {
    filter: (node) => {
      return node.nodeName === 'FIGURE' &&
             (node as HTMLElement).classList?.contains('kg-card') &&
             (node as HTMLElement).classList?.contains('kg-image-card');
    },
    replacement: (_content, node) => {
      const el = node as HTMLElement;
      const img = el.querySelector('img');
      const figcaption = el.querySelector('figcaption');

      if (!img) return '';

      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      const caption = figcaption ? figcaption.textContent?.trim() || '' : '';

      if (caption) {
        return `![${alt}](${src})\n*${caption}*`;
      }
      return `![${alt}](${src})`;
    },
  });

  // Custom rule: handle kg-header-card (used on about page)
  turndown.addRule('kgHeaderCard', {
    filter: (node) => {
      return node.nodeName === 'DIV' &&
             (node as HTMLElement).classList?.contains('kg-header-card');
    },
    replacement: (content) => {
      return content;
    },
  });

  // Custom rule: handle <pre><code> with language class
  turndown.addRule('fencedCodeBlock', {
    filter: (node, options) => {
      return (
        options.codeBlockStyle === 'fenced' &&
        node.nodeName === 'PRE' &&
        node.firstChild !== null &&
        node.firstChild.nodeName === 'CODE'
      );
    },
    replacement: (_content, node) => {
      const codeEl = node.firstChild as HTMLElement;
      const code = codeEl.textContent || '';

      // Extract language from class
      const classAttr = codeEl.getAttribute('class') || '';
      const langMatch = classAttr.match(/language-(\S+)/);
      const lang = langMatch ? langMatch[1] : '';

      return '\n\n```' + lang + '\n' + code + '\n```\n\n';
    },
  });

  let markdown = turndown.turndown(contentHTML);

  // Clean up: remove excessive blank lines
  markdown = markdown.replace(/\n{4,}/g, '\n\n\n');
  markdown = markdown.trim();

  // Build frontmatter
  const frontmatter = `---
title: ${toYAML(meta.title)}
published: ${meta.published.toISOString()}${meta.updated && meta.updated.getTime() !== meta.published.getTime() ? `\nupdated: ${meta.updated.toISOString()}` : ''}
tags: ${toYAML(meta.tags)}
author: ${toYAML(meta.author)}
authorSlug: ngurah
slug: ${toYAML(slug)}${meta.featuredImage ? `\nfeaturedImage: ${toYAML(meta.featuredImage)}` : ''}${meta.excerpt ? `\nexcerpt: ${toYAML(meta.excerpt)}` : ''}
---`;

  fs.writeFileSync(path.join(POSTS_DIR, `${slug}.md`), frontmatter + '\n\n' + markdown);
  return true;
}

function convertPage(pageDir: string, slug: string): boolean {
  const indexPath = path.join(pageDir, 'index.html');
  if (!fs.existsSync(indexPath)) return false;

  const raw = fs.readFileSync(indexPath, 'utf-8');
  const $ = cheerio.load(raw);

  const meta = extractMetadata($);
  const contentHTML = extractContentHTML($);

  if (!contentHTML.trim()) {
    console.log(`  ⚠  Empty content in page ${slug}, skipping`);
    return false;
  }

  const turndown = new TurndownService({
    codeBlockStyle: 'fenced',
    headingStyle: 'atx',
    bulletListMarker: '-',
  });

  // Apply same custom rules
  turndown.addRule('kgImageCard', {
    filter: (node) => {
      return node.nodeName === 'FIGURE' &&
             (node as HTMLElement).classList?.contains('kg-card') &&
             (node as HTMLElement).classList?.contains('kg-image-card');
    },
    replacement: (_content, node) => {
      const el = node as HTMLElement;
      const img = el.querySelector('img');
      const figcaption = el.querySelector('figcaption');
      if (!img) return '';
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      const caption = figcaption ? figcaption.textContent?.trim() || '' : '';
      if (caption) return `![${alt}](${src})\n*${caption}*`;
      return `![${alt}](${src})`;
    },
  });

  let markdown = turndown.turndown(contentHTML);
  markdown = markdown.replace(/\n{4,}/g, '\n\n\n').trim();

  const frontmatter = `---
title: ${toYAML(meta.title)}${meta.published ? `\npublished: ${meta.published.toISOString()}` : ''}
---`;

  fs.writeFileSync(path.join(PAGES_DIR, `${slug}.md`), frontmatter + '\n\n' + markdown);
  return true;
}

// Main
console.log('🔍 Discovering posts...\n');

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.mkdirSync(PAGES_DIR, { recursive: true });

const rootDirs = fs.readdirSync(REPO_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.') && !EXCLUDE.has(d.name));

let postCount = 0;
let pageCount = 0;
const skipped: string[] = [];

for (const dir of rootDirs) {
  const indexPath = path.join(REPO_ROOT, dir.name, 'index.html');
  if (!fs.existsSync(indexPath)) {
    skipped.push(dir.name);
    continue;
  }

  const slug = sanitizeSlug(dir.name);
  console.log(`  📄 ${dir.name} → ${slug}`);
  postCount++;
  convertPost(path.join(REPO_ROOT, dir.name), slug);
}

// Convert the about page
const aboutDir = path.join(REPO_ROOT, 'about');
if (fs.existsSync(path.join(aboutDir, 'index.html'))) {
  console.log('\n📄 Converting about page...');
  pageCount++;
  convertPage(aboutDir, 'about');
}

console.log(`\n✅ Converted ${postCount} posts, ${pageCount} pages`);
if (skipped.length > 0) {
  console.log(`⚠  Skipped ${skipped.length} dirs without index.html: ${skipped.join(', ')}`);
}
