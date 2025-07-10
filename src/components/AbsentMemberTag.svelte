<script>
  import MemberTag from './MemberTag.svelte';
  
  export let text = '';
  export let tooltip = '';
</script>

<MemberTag 
  {text}
  {tooltip}
  showButton={false}
  tagGradient="from-slate-600/80 to-slate-700/80"
  tagTextColor="text-slate-300"
  tagShadowColor="shadow-slate-500/25"
  tagHoverShadowColor="group-hover:shadow-slate-500/40"
  customClasses="line-through opacity-70 cursor-help"
/>