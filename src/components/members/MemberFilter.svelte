<script>
	import Icon from '../common/Icon.svelte';
	import { gradients } from '../../lib/designTokens.js';

	let { filterText = $bindable('') } = $props();
</script>

<div class="relative mb-4">
	<input 
		bind:value={filterText}
		type="text" 
		placeholder="Filtrer les membres..."
		class="w-full px-3 py-2 {gradients.input} backdrop-blur-sm border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
	>
	<div class="absolute right-3 top-2.5 text-slate-400">
		<Icon name="search" size="w-5 h-5" />
	</div>
</div>