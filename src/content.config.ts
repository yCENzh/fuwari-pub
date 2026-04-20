import { defineCollection, type CollectionEntry } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const postSchema = z.object({
	title: z.string(),
	published: z.date(),
	updated: z.date().optional(),
	draft: z.boolean().optional().default(false),
	description: z.string().optional().default(""),
	image: z.string().optional().default(""),
	tags: z.array(z.string()).optional().default([]),
	category: z.string().optional().nullable().default(""),

	pinned: z.boolean().optional().default(false),

	series: z.string().optional(),

	/* For internal use */
	prevTitle: z.string().default(""),
	prevSlug: z.string().default(""),
	nextTitle: z.string().default(""),
	nextSlug: z.string().default(""),
});

export type PostData = z.infer<typeof postSchema>;

const postsCollection = defineCollection({
	loader: glob({
		pattern: "**/*.md",
		base: "./src/content/posts/",
		// 使用完整相对路径作为 id，修复 index.md 文件的封面图片路径问题
		// 当文件名是 index.md 时，去掉 /index，使 URL 更简洁
		generateId: ({ entry }) =>
			entry.replace(/\/index\.md$/, "").replace(/\.md$/, ""),
	}),
	schema: postSchema,
});

const specCollection = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/spec/" }),
	schema: z.object({}),
});

export const collections = {
	posts: postsCollection,
	spec: specCollection,
} as const;
