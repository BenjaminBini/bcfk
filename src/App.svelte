<script>
  import Router from "svelte-spa-router";
  import { location } from "svelte-spa-router";
  import HomePage from "./pages/HomePage.svelte";
  import AssignmentsPage from "./pages/AssignmentsPage.svelte";
  import AbsencesPage from "./pages/AbsencesPage.svelte";
  import MembersPage from "./pages/MembersPage.svelte";
  import AuditLogsPage from "./pages/AuditLogsPage.svelte";
  import TestUnifiedPage from "./pages/TestUnifiedPage.svelte";
  import NavigationBar from "./components/navigation/NavigationBar.svelte";
  import LegendModal from "./components/modals/LegendModal.svelte";
  import Toast from "./components/common/Toast.svelte";
  import { showLegendModal } from "./stores/legend.js";

  const routes = {
    "/": HomePage,
    "/assignments": AssignmentsPage,
    "/absences": AbsencesPage,
    "/members": MembersPage,
    "/audit-logs": AuditLogsPage,
    "/test": TestUnifiedPage,
  };

  const navigationItems = [
    { href: "/", label: "📅 Planning" },
    { href: "/assignments", label: "🔁 Affectations hebdomadaires" },
    { href: "/absences", label: "✈️ Absences" },
    { href: "/members", label: "👥 Membres" },
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
    isOpen={$showLegendModal}
    onClose={() => showLegendModal.set(false)}
  />

  <!-- Toast Notifications -->
  <Toast />
</div>
