// biome-ignore lint/suspicious/noShadowRestrictedNames: <toString from mdast-util-to-string>
import { toString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

// 计算阅读时间、字数和摘要
export function remarkPostMetadata() {
	return (tree, { data }) => {
		const textOnPage = toString(tree);

		const readingTime = getReadingTime(textOnPage);
		data.astro.frontmatter.minutes = Math.max(
			1,
			Math.round(readingTime.minutes),
		);
		data.astro.frontmatter.words = readingTime.words;

		for (const node of tree.children) {
			if (node.type !== "paragraph") {
				continue;
			}
			data.astro.frontmatter.excerpt = toString(node);
			break;
		}
	};
}
