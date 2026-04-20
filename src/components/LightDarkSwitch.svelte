<script lang="ts">
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import Icon from "@iconify/svelte";
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "@utils/setting-utils.ts";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";

const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
const icons: Record<LIGHT_DARK_MODE, string> = {
	[LIGHT_MODE]: "material-symbols:wb-sunny-outline-rounded",
	[DARK_MODE]: "material-symbols:dark-mode-outline-rounded",
	[AUTO_MODE]: "material-symbols:radio-button-partial-outline",
};

let mode = $state<LIGHT_DARK_MODE>(AUTO_MODE);
let panelEl: HTMLElement | undefined = $state.raw();
let panelTimeout: ReturnType<typeof setTimeout> | null = null;

$effect(() => {
	mode = getStoredTheme();
	
	const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
	const handler = () => {
		if (mode === AUTO_MODE) applyThemeToDocument(AUTO_MODE);
	};
	
	darkModePreference.addEventListener("change", handler);
	return () => {
		darkModePreference.removeEventListener("change", handler);
		if (panelTimeout) clearTimeout(panelTimeout);
	};
});

function switchScheme(newMode: LIGHT_DARK_MODE) {
	mode = newMode;
	setTheme(newMode);
	if (newMode === AUTO_MODE) applyThemeToDocument(AUTO_MODE);
}

function toggleScheme() {
	switchScheme(seq[(seq.indexOf(mode) + 1) % seq.length]);
}

function showPanel() {
	if (panelTimeout) {
		clearTimeout(panelTimeout);
		panelTimeout = null;
	}
	panelEl?.classList.remove("float-panel-closed");
}

function hidePanel() {
	if (panelTimeout) clearTimeout(panelTimeout);
	panelTimeout = setTimeout(() => {
		panelEl?.classList.add("float-panel-closed");
		panelTimeout = null;
	}, 150);
}
</script>

<div class="relative z-50" onmouseleave={hidePanel} role="presentation">
	<button
		aria-label="Light/Dark Mode"
		aria-haspopup="menu"
		class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
		onclick={toggleScheme}
		onmouseenter={showPanel}
	>
		<Icon icon={icons[mode]} class="text-[1.25rem]" />
	</button>

	<div
		bind:this={panelEl}
		class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5"
		role="menu"
	>
		<div class="card-base float-panel p-2">
			{#each [{ m: LIGHT_MODE, t: "你相信光吗" }, { m: DARK_MODE, t: "拥抱黑暗吧" }, { m: AUTO_MODE, t: "跟着系统变" }] as { m, t } (m)}
				<button
					role="menuitem"
					class="flex transition whitespace-nowrap items-center justify-start! w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
					class:current-theme-btn={mode === m}
					onclick={() => switchScheme(m)}
				>
					<Icon icon={icons[m]} class="text-[1.25rem] mr-3" />
					{t}
				</button>
			{/each}
		</div>
	</div>
</div>