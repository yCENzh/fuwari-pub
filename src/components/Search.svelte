<script lang="ts">
import Icon from "@iconify/svelte";

interface PagefindResult {
	url: string;
	meta: { title: string };
	excerpt: string;
}

let query = $state("");
let results = $state<PagefindResult[]>([]);
let loading = $state(false);
let show = $state(false);
let pagefind: any = null;

function clickOutside(node: HTMLElement, cb: () => void) {
	const onClick = (e: MouseEvent) => {
		if (node && !node.contains(e.target as Node) && !e.defaultPrevented) cb();
	};
	document.addEventListener("click", onClick, true);
	return {
		destroy() {
			document.removeEventListener("click", onClick, true);
		},
	};
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function highlightText(text: string, term: string): string {
	if (!term || !text) return text;
	const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const escapedText = escapeHtml(text);
	return escapedText.replace(
		new RegExp(`(${safeTerm})`, "gi"),
		"<mark>$1</mark>",
	);
}

async function loadPagefind() {
	if (pagefind) return pagefind;
	try {
		const pagefindPath = "/pagefind/pagefind.js";
		pagefind = await import(/* @vite-ignore */ pagefindPath);
		await pagefind.init();
		return pagefind;
	} catch {
		console.warn("Pagefind not available");
		return null;
	}
}

// focus 时预加载 pagefind
async function onFocus() {
	if (query) show = true;
	if (!pagefind) loadPagefind();
}

async function handleSearch(term: string) {
	if (!show) show = true;

	if (!pagefind) {
		loading = true;
		await loadPagefind();
	}

	if (!pagefind) {
		loading = false;
		results = [];
		return;
	}

	loading = true;
	try {
		const search = await pagefind.debouncedSearch(term, {}, 300);
		if (search === null) {
			loading = false;
			return;
		}

		const data = await Promise.all(
			search.results.slice(0, 10).map((r) => r.data()),
		);
		results = data.map((r) => ({
			url: r.url,
			meta: r.meta,
			excerpt: r.excerpt,
		}));
	} finally {
		loading = false;
	}
}

function onInput() {
	const term = query.trim();
	if (!term) {
		results = [];
		return;
	}
	// 预加载索引
	if (pagefind) pagefind.preload(term);
	handleSearch(term);
}
</script>

<div class="relative" use:clickOutside={() => show = false}>
	<!-- Desktop Input -->
	<div class="hidden lg:flex items-center h-11 mr-2 rounded-lg transition-colors
		bg-[#f0f0f0] hover:bg-[#e0e0e0] focus-within:bg-[#e0e0e0]
		dark:bg-[#2a2a2a] dark:hover:bg-[#3a3a3a] dark:focus-within:bg-[#3a3a3a]">
		<Icon icon="material-symbols:search" class="absolute text-xl ml-3 text-black/30 dark:text-white/30 pointer-events-none" />
		<input
			placeholder="往事书"
			bind:value={query}
			oninput={onInput}
			onfocus={onFocus}
			class="pl-10 text-sm bg-transparent outline-hidden h-full w-40 focus:w-60 transition-all text-black/50 dark:text-white/50"
		/>
	</div>

	<!-- Mobile Trigger Button -->
	<button
		onclick={() => show = !show}
		aria-label="Search"
		class="lg:hidden! rounded-lg w-11 h-11 flex items-center justify-center active:scale-90 transition-transform"
	>
		<Icon icon="material-symbols:search" class="text-xl" />
	</button>

	<!-- Results Panel -->
	<div class="float-panel fixed md:absolute top-20 md:top-12 left-4 right-4 md:left-auto md:right-0 md:w-120
		shadow-2xl rounded-2xl z-50 max-h-[80vh] overflow-hidden
		bg-white dark:bg-[#1e1e1e]
		flex flex-col
		{show ? '' : 'float-panel-closed'}">

		<!-- Mobile Input -->
		<div class="flex relative lg:hidden items-center h-11 flex-shrink-0 bg-[#f0f0f0] dark:bg-[#2a2a2a]">
			<Icon icon="material-symbols:search" class="absolute text-xl ml-3 text-black/30 dark:text-white/30" />
			<input
				placeholder="Search..."
				bind:value={query}
				oninput={onInput}
				onfocus={onFocus}
				class="pl-10 w-full h-full text-sm bg-transparent outline-hidden text-black/50 dark:text-white/50"
			/>
		</div>

		<!-- Results -->
		<div class="overflow-y-auto overflow-x-hidden p-2 flex-1">
			{#if loading}
				<div class="flex items-center justify-center py-6 text-black/50 dark:text-white/50 gap-2">
					<Icon icon="line-md:loading-loop" class="text-xl" />
					<span class="text-xs">搜索中...</span>
				</div>
			{:else if !query}
				<div class="text-center py-6 text-sm text-black/30 dark:text-white/30">
					搜点什么吧
				</div>
			{:else if !results.length}
				<div class="text-center py-6 text-sm text-black/40 dark:text-white/40">
					未找到结果
				</div>
			{:else}
				{#each results as item (item.url)}
					<a
						href={item.url}
						onclick={() => show = false}
						class="group block rounded-xl px-3 py-2 hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-colors"
					>
						<div class="font-bold text-lg group-hover:text-(--primary) flex items-center transition-colors">
							<span>{@html highlightText(item.meta.title, query)}</span>
							<Icon icon="fa6-solid:chevron-right" class="text-xs ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-(--primary)" />
						</div>
						<div class="text-xs text-black/40 dark:text-white/40 truncate mt-0.5">
							{item.url}
						</div>
						<div class="text-sm text-black/60 dark:text-white/60 line-clamp-2 leading-relaxed mt-1">
							{@html item.excerpt}
						</div>
					</a>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	:global(mark) {
		background-color: rgba(250,200,210,0.5);
		color: inherit;
		border-radius: 2px;
		padding: 0 2px;
	}
</style>
