import { type CollectionEntry, getCollection, render } from "astro:content";
import { getCategoryUrl } from "@utils/url-utils.ts";
import type { BlogPostData } from "../types/config";

// 缓存已渲染的文章元数据
const renderedPostsCache = new Map<
	string,
	{ excerpt: string; words: number; minutes: number }
>();

// 发布状态过滤函数 - 统一用于所有 Collection 查询
export function isPublished({ data }: { data: { draft?: boolean } }): boolean {
	return import.meta.env.PROD ? data.draft !== true : true;
}

// 获取并按日期排序文章
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", isPublished);

	const sorted = allBlogPosts.sort((a, b) => {
		if (a.data.pinned && !b.data.pinned) return -1;
		if (!a.data.pinned && b.data.pinned) return 1;
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		if (dateA > dateB) return -1;
		if (dateA < dateB) return 1;
		return 0;
	});
	return sorted;
}

// 批量预渲染文章元数据
async function prerenderPostsMetadata(posts: CollectionEntry<"posts">[]) {
	const results = new Map<
		string,
		{ excerpt: string; words: number; minutes: number }
	>();

	await Promise.all(
		posts.map(async (post) => {
			if (renderedPostsCache.has(post.id)) {
				results.set(post.id, renderedPostsCache.get(post.id)!);
				return;
			}

			const { remarkPluginFrontmatter } = await render(post);
			const metadata = {
				excerpt: remarkPluginFrontmatter.excerpt || "",
				words: remarkPluginFrontmatter.words || 0,
				minutes: remarkPluginFrontmatter.minutes || 1,
			};
			renderedPostsCache.set(post.id, metadata);
			results.set(post.id, metadata);
		}),
	);

	return results;
}

export async function getSortedPosts(): Promise<CollectionEntry<"posts">[]> {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].id;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].id;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}

// 带预渲染元数据的文章类型
export type PostWithMetadata = CollectionEntry<"posts"> & {
	metadata: {
		excerpt: string;
		words: number;
		minutes: number;
	};
};

// 获取带预渲染元数据的文章列表
export async function getSortedPostsWithMetadata(): Promise<
	PostWithMetadata[]
> {
	const sorted = await getSortedPosts();
	const metadataMap = await prerenderPostsMetadata(sorted);

	return sorted.map((post) => ({
		...post,
		metadata: metadataMap.get(post.id) || { excerpt: "", words: 0, minutes: 1 },
	}));
}
export type PostForList = {
	id: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();
	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		id: post.id,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", isPublished);

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", isPublished);
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			// 不再为未分类的文章创建"未分类"分类
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

export async function getPostSeries(
	seriesName: string,
): Promise<{ body: string; data: BlogPostData; slug: string }[]> {
	const posts = (await getCollection("posts", ({ data }) => {
		return isPublished({ data }) && data.series === seriesName;
	})) as unknown as { body: string; data: BlogPostData; slug: string }[];

	posts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? 1 : dateA < dateB ? -1 : 0;
	});

	return posts;
}
