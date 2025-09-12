<script>
	import SelectableMemberTag from './SelectableMemberTag.svelte';

	let { 
		members = [],
		selectedMembers = $bindable(new Set()),
		filterText = '',
		onToggleMember = null
	} = $props();

	function toggleMember(member) {
		// Safety check: don't allow selection of absent or assigned members
		if (member.status === 'absent' || member.status === 'assigned') {
			return;
		}
		
		if (selectedMembers.has(member.id)) {
			selectedMembers.delete(member.id);
		} else {
			selectedMembers.add(member.id);
		}
		// Trigger reactivity by reassigning
		selectedMembers = new Set(selectedMembers);

		if (onToggleMember) {
			onToggleMember(member);
		}
	}
</script>

<div class="space-y-3 max-h-60 overflow-y-auto overflow-x-visible p-1 -m-1">
	{#if members.length === 0}
		<p class="text-slate-400 text-center">
			{filterText ? 'Aucun membre trouvé' : 'Aucun membre disponible'}
		</p>
	{:else}
		<div class="flex flex-wrap gap-2 p-1 overflow-visible">
			{#each members as member (member.id)}
				<SelectableMemberTag
					{member}
					isSelected={selectedMembers.has(member.id)}
					onToggle={toggleMember}
				/>
			{/each}
		</div>
	{/if}
</div>