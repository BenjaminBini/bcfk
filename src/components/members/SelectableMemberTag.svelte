<script>
	import { gradients, shadows } from '../../lib/designTokens.js';

	let { 
		member,
		isSelected = false,
		onToggle = null 
	} = $props();

	function handleClick() {
		if (member.status !== 'available') return;
		
		if (onToggle) {
			onToggle(member);
		}
	}
</script>

{#if member.status === 'available'}
	<button 
		class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transform hover:scale-105 shadow-lg {isSelected ? `${gradients.selected} ${shadows.success} ${gradients.selectedHover} ${shadows.successHover}` : `${gradients.primary} ${shadows.primary} ${gradients.primaryHover} ${shadows.primaryHover}`}"
		onclick={handleClick}
	>
		{member.first_name}
	</button>
{:else}
	<div 
		class="relative inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-300 rounded-full cursor-not-allowed {gradients.iconBackground} opacity-60 backdrop-blur-sm border border-slate-500/30"
		title={member.status === 'assigned' ? 'Ce membre est déjà assigné à ce créneau' : 'Ce membre est absent'}
	>
		{member.first_name}
	</div>
{/if}