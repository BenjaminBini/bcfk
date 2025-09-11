<script>
  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";
  import AbsenceMemberTag from "./AbsenceMemberTag.svelte";

  let {
    title,
    members,
    getAbsencePeriod,
    dayIndex,
    onShowAbsenceDetails,
  } = $props();
</script>

{#if members.length > 0}
  <div>
    <div class="mb-2 text-xs font-medium text-center text-slate-400">
      {title}
    </div>
    <div class="flex flex-wrap items-center justify-center gap-1">
      {#each members as member (member.member_id || member.id)}
        <div animate:flip={{ duration: 300, easing: quintOut, delay: 200 }}>
          <AbsenceMemberTag
            {member}
            absencePeriod={getAbsencePeriod(member.member_id, dayIndex)}
            onShowDetails={onShowAbsenceDetails}
          />
        </div>
      {/each}
    </div>
  </div>
{/if}