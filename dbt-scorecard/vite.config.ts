import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Fully static, client-rendered prototype (mock data only, no backend), so it's
			// prerendered to plain HTML/CSS/JS. See https://svelte.dev/docs/kit/adapter-static.
			adapter: adapter()
		})
	]
});
