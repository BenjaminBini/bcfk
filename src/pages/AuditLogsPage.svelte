<script>
  import { onMount } from "svelte";
  import PageHeader from "../components/PageHeader.svelte";
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AuditLogsList from "../components/audit/AuditLogsList.svelte";
  import LoadMoreButton from "../components/audit/LoadMoreButton.svelte";
  import { auditLogs, isLoading, error, hasMoreLogs, auditLogActions, processAuditLog } from "../stores/auditLogs.js";

  let processedLogs = $derived($auditLogs.map(log => processAuditLog(log)));

  onMount(async () => {
    await auditLogActions.loadLogs(true);
  });

  async function handleLoadMore() {
    await auditLogActions.loadMore();
  }
</script>

<div class="py-4 md:py-10">
  <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
    <!-- Page header -->
    <PageHeader
      title="Historique des modifications"
      mobileTitle="Historique"
      subtitle="Historique de toutes les actions effectuées sur le planning"
    />

    <!-- Content -->
    <div class="mt-4 md:mt-8">
      <ContentWrapper isLoading={$isLoading} error={$error}>
        <div class="space-y-4">
          <AuditLogsList logs={processedLogs} isLoading={$isLoading} />
          <LoadMoreButton 
            isLoading={$isLoading} 
            hasMore={$hasMoreLogs} 
            onLoadMore={handleLoadMore} 
          />
        </div>
      </ContentWrapper>
    </div>
  </div>
</div>

