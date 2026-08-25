import { describe, expect, test } from "vitest";

import {
  buildArticleRoutes,
  legacyPathToHref,
  RESERVED_ARTICLE_ROUTES,
} from "../src/lib/articles";

describe("article routes", () => {
  test("normalizes legacy docsify paths into preserved article hrefs", () => {
    expect(legacyPathToHref("#/python/functions")).toBe("/python/functions/");
    expect(legacyPathToHref("#/system/api/index")).toBe("/system/api/");
    expect(legacyPathToHref("#/README")).toBe("/");
  });

  test("orders previous and next links from generated navigation while skipping reserved routes", () => {
    const routes = buildArticleRoutes(
      [
        {
          id: "README.md",
          data: { title: "Home", description: "", legacyPath: "#/README" },
        },
        {
          id: "coding/tree/index.md",
          data: {
            title: "关于二叉树，是所有高级图论算法的基础",
            description: "",
            legacyPath: "#/coding/tree/index",
          },
        },
        {
          id: "coding/tree/postorder.md",
          data: {
            title: "后序遍历位置分治",
            description: "",
            legacyPath: "#/coding/tree/postorder",
          },
        },
        {
          id: "coding/tree/reconstruct.md",
          data: {
            title: "二叉树构建",
            description: "",
            legacyPath: "#/coding/tree/reconstruct",
          },
        },
        {
          id: "coding/tree/bst.md",
          data: {
            title: "BST 模板题",
            description: "",
            legacyPath: "#/coding/tree/bst",
          },
        },
        {
          id: "about/index.md",
          data: { title: "About", description: "", legacyPath: "#/about/index" },
        },
      ] as never,
      [
        {
          title: "Home",
          href: "/",
          items: [],
        },
        {
          title: "Algo",
          href: "/coding/",
          items: [
            {
              title: "二叉树",
              href: "/coding/tree/",
              children: [
                {
                  title: "后序遍历位置分治",
                  href: "/coding/tree/postorder/",
                  children: [],
                },
                {
                  title: "二叉树构建",
                  href: "/coding/tree/reconstruct/",
                  children: [],
                },
                {
                  title: "BST 模板题",
                  href: "/coding/tree/bst/",
                  children: [],
                },
              ],
            },
          ],
        },
        {
          title: "About",
          href: "/about/",
          items: [],
        },
      ],
      RESERVED_ARTICLE_ROUTES,
    );

    expect(routes.map((route) => route.href)).toEqual([
      "/coding/tree/",
      "/coding/tree/postorder/",
      "/coding/tree/reconstruct/",
      "/coding/tree/bst/",
    ]);
    expect(routes[2]).toMatchObject({
      href: "/coding/tree/reconstruct/",
      previous: { href: "/coding/tree/postorder/", title: "后序遍历位置分治" },
      next: { href: "/coding/tree/bst/", title: "BST 模板题" },
    });
  });

  test("throws a path-specific error when two notes produce the same article href", () => {
    expect(() =>
      buildArticleRoutes(
        [
          {
            id: "guides/intro.md",
            data: { title: "Intro", description: "", legacyPath: "#/guides/intro" },
          },
          {
            id: "guides/intro/index.md",
            data: { title: "Intro Home", description: "", legacyPath: "#/guides/intro/index" },
          },
        ] as never,
        [],
      ),
    ).toThrow(/Duplicate article route "\/guides\/intro\/"/);
  });
});
