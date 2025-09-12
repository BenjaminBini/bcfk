<script>
	import { styledButtons } from '../../lib/designTokens.js';

	let { 
		selectedMembers = new Set(),
		onSubmit = null,
		onCancel = null
	} = $props();

	function handleSubmit() {
		if (onSubmit) {
			onSubmit(Array.from(selectedMembers));
		}
	}

	function handleCancel() {
		if (onCancel) {
			onCancel();
		}
	}
</script>

<div class="flex justify-end space-x-3 mt-6">
	<button 
		onclick={handleCancel} 
		class="{styledButtons.secondary}"
	>
		Annuler
	</button>
	<button 
		onclick={handleSubmit}
		disabled={selectedMembers.size === 0}
		class="{styledButtons.success}"
	>
		Valider ({selectedMembers.size})
	</button>
</div>