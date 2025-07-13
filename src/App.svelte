<script>
  import Router from "svelte-spa-router";
  import { location } from "svelte-spa-router";
  import HomePage from "./pages/HomePage.svelte";
  import AssignmentsPage from "./pages/AssignmentsPage.svelte";
  import AbsencesPage from "./pages/AbsencesPage.svelte";
  import AuditLogsPage from "./pages/AuditLogsPage.svelte";
  import NavigationBar from "./components/navigation/NavigationBar.svelte";
  import LegendModal from "./components/modals/LegendModal.svelte";
  import { showLegendModal } from "./stores/legend.js";

  const routes = {
    "/": HomePage,
    "/assignments": AssignmentsPage,
    "/absences": AbsencesPage,
    "/audit-logs": AuditLogsPage,
  };

  const navigationItems = [
    { href: "/", label: "📅 Planning" },
    { href: "/assignments", label: "🔁 Affectations hebdomadaires" },
    { href: "/absences", label: "✈️ Absences" },
    { href: "/audit-logs", label: "📋 Historique" },
  ];

  function handleShowLegend() {
    showLegendModal.set(true);
  }
</script>

<div class="overflow-hidden relative min-h-screen bg-slate-900 dark">
  <!-- Background elements -->

  <!-- Navigation -->
  <NavigationBar 
    {navigationItems}
    currentLocation={$location}
    onShowLegend={handleShowLegend}
  />

  <!-- Main content -->
  <main class="relative">
    <Router {routes} />
  </main>

  <!-- Legend Modal -->
  <LegendModal
    show={$showLegendModal}
    onClose={() => showLegendModal.set(false)}
  />
</div>
