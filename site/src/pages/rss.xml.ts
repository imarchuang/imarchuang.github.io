import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL("https://imarchuang.github.io");
  const escapeXml = (value: string) =>
    value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const items = [
    {
      title: "技术笔记",
      description: "关于产品、平台、系统设计与工程实践的持续工作记录。",
      path: "/notes/",
    },
    {
      title: "视觉作品",
      description: "交互图解、视觉实验与学习工具。",
      path: "/work/",
    },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Marc Huang — 产品、平台与系统思考</title>
    <link>${new URL("/", baseUrl)}</link>
    <description>用产品思维和技术领导力，让复杂系统变得清晰、可用。</description>
    <language>zh-CN</language>
    ${items.map((item) => `<item>
      <title>${escapeXml(item.title)}</title>
      <link>${new URL(item.path, baseUrl)}</link>
      <guid>${new URL(item.path, baseUrl)}</guid>
      <description>${escapeXml(item.description)}</description>
    </item>`).join("\n    ")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
