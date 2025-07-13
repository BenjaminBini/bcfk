<script>
  import AbsentMemberTag from "../members/AbsentMemberTag.svelte";
  import RecurrentMemberTag from "../members/RecurrentMemberTag.svelte";
  import SpecificDateMemberTag from "../members/SpecificDateMemberTag.svelte";
  import AddMemberButton from "../members/AddMemberButton.svelte";
  import LegendPanel from "./LegendPanel.svelte";
  import LegendItem from "./LegendItem.svelte";
  import LegendButton from "./LegendButton.svelte";
  import { getIcon } from "../../lib/icons";
</script>

<LegendPanel>
  <!-- Member Tags -->
  <LegendItem description="Assigné au créneau">
    <RecurrentMemberTag text="Benjamin" tooltip="Membre" />
  </LegendItem>
  
  <LegendItem description="Absent">
    <AbsentMemberTag text="Christian" tooltip="Absent" />
  </LegendItem>
  
  <LegendItem description="Présence ponctuelle">
    <SpecificDateMemberTag text="Bruno" tooltip="Spécifique" />
  </LegendItem>
  
  <LegendItem description="Inscription">
    <AddMemberButton text="Inscription" tooltip="Ajouter" />
  </LegendItem>
  
  <LegendItem description="Déclarer une absence">
    <LegendButton 
      iconPath={getIcon("plane").path}
      gradientFrom="from-orange-400/100"
      gradientTo="to-orange-700"
      ariaLabel="Déclarer une absence"
      title="Déclarer une absence"
    />
  </LegendItem>
  
  <LegendItem description="Supprimer">
    <LegendButton 
      iconPath="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
      gradientFrom="from-red-500"
      gradientTo="to-red-600"
      ariaLabel="Supprimer"
      title="Supprimer"
    />
  </LegendItem>
</LegendPanel>
