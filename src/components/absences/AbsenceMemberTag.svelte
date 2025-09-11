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
  class="inline-block px-2 py-1 text-xs font-medium transition-all duration-300 border rounded-full cursor-pointer bg-gradient-to-r backdrop-blur-sm text-slate-200 from-slate-500/80 to-slate-600/80 border-slate-400/30 hover:from-slate-400/80 hover:to-slate-500/80 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
  title={`Absent ${absencePeriod}`}
  onclick={() => onShowDetails?.(renderMemberName(member), member.member_id)}
  in:scale={{
    duration: 400,
    easing: quintOut,
    start: 0.5,
    opacity: 0,
  }}
  out:scale={{
    duration: 200,
    easing: quintOut,
    start: 0.5,
    opacity: 0,
  }}
>
  {renderMemberName(member)}
</button>