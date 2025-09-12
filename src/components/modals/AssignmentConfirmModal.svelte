<script>
  import BaseModal from "../common/BaseModal.svelte";

  /**
   * @typedef {Object} Props
   * @property {boolean} [isOpen]
   * @property {Array} [members]
   * @property {number} [dayIndex]
   * @property {string} [date]
   * @property {string} [slotType]
   * @property {function} [onConfirm]
   * @property {function} [onCancel]
   */

  /** @type {Props} */
  let {
    isOpen = false,
    members = [],
    dayIndex = 0,
    date = null,
    slotType = "",
    onConfirm = null,
    onCancel = null,
  } = $props();

  function handleConfirm() {
    console.log("[DEBUG] AssignmentConfirmModal.handleConfirm called");
    console.log("[DEBUG] About to call onConfirm with data:", {
      members,
      dayIndex,
      slotType,
      date,
    });
    onConfirm?.();
    console.log("[DEBUG] onConfirm called successfully");
  }

  function handleCancel() {
    onCancel?.();
  }

  $effect(() => {
    console.log("[DEBUG] AssignmentConfirmModal rendered with:", {
      isOpen,
      members,
      dayIndex,
      date,
      slotType,
    });
    console.log("[DEBUG] AssignmentConfirmModal - members array:", members);
    console.log(
      "[DEBUG] AssignmentConfirmModal - members.length:",
      members?.length
    );
    console.log(
      "[DEBUG] AssignmentConfirmModal - rendering condition:",
      isOpen && members && members.length > 0
    );
  });
</script>

{#if isOpen && members && members.length > 0}
  <!-- TEMPORARY DEBUG: Simple modal without BaseModal -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <div
      class="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
    >
      <h2 class="text-lg font-semibold text-center text-white mb-4">
        Confirmer l'affectation
      </h2>

      <div class="space-y-4 mb-6">
        <p class="text-sm text-center text-slate-300">
          Voulez-vous affecter
          <strong class="text-white"
            >{members[0]?.first_name || members[0]?.full_name}</strong
          >
          au créneau
          <strong class="text-white">{slotType}</strong>
          du
          <strong class="text-white">{date}</strong>
          ?
        </p>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          onclick={handleCancel}
          class="px-4 py-2 text-sm font-medium transition-colors text-slate-400 hover:text-white"
        >
          Annuler
        </button>
        <button
          onclick={handleConfirm}
          class="px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          Confirmer
        </button>
      </div>
    </div>
  </div>
{:else if isOpen}
  <!-- Debug: Show empty modal state -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <div class="bg-red-500 text-white p-4 rounded-lg">
      <h3>DEBUG: Empty Modal State</h3>
      <p>isOpen: {isOpen}</p>
      <p>members: {JSON.stringify(members)}</p>
      <p>members.length: {members?.length || "undefined"}</p>
      <button
        onclick={handleCancel}
        class="mt-2 px-3 py-1 bg-white text-red-500 rounded">Close</button
      >
    </div>
  </div>
{/if}
