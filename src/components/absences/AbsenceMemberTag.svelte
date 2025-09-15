<script>
  import { scale } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";

  let {
    member,
    absencePeriod,
    onShowDetails = null,
  } = $props();

  function renderMemberName(member) {
    return member.first_name || "Membre inconnu";
  }
</script>

<button
  type="button"
  class="inline-block px-2 py-1 text-xs font-medium transition-all duration-300 border rounded-full cursor-pointer bg-gradient-to-r backdrop-blur-sm text-slate-200 from-slate-500/80 hover:scale-105 to-slate-600/80 border-slate-400/30 focus:outline-none focus:ring-2 focus:ring-slate-400/50 hover:shadow-lg hover:shadow-slate-400/30 hover:brightness-130"
  title={`Absent ${absencePeriod}`}
  onclick={() => {
    // Pass the complete member object which contains all necessary data
    const completeMember = { ...member };
    onShowDetails?.(completeMember);
  }}
>
  {renderMemberName(member)}
</button>