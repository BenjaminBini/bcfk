import { writable } from 'svelte/store';

// Audit logs store
export const auditLogs = writable([]);
export const isLoading = writable(true);
export const error = writable(null);
export const currentPage = writable(0);
export const hasMoreLogs = writable(true);

const PAGE_SIZE = 50;

// Helper functions for processing audit log data
export function getActionIcon(actionType) {
  switch (actionType) {
    case 'CREATE': return 'plus';
    case 'UPDATE': return 'pencil';
    case 'DELETE': return 'trash';
    default: return 'document';
  }
}

export function getActionColor(actionType) {
  switch (actionType) {
    case 'CREATE': return 'text-green-400';
    case 'UPDATE': return 'text-blue-400';
    case 'DELETE': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function getEntityTypeLabel(entityType) {
  switch (entityType) {
    case 'member': return 'Membre';
    case 'recurring_assignment': return 'Affectation récurrente';
    case 'specific_assignment': return 'Affectation spécifique';
    case 'absence': return 'Absence';
    default: return entityType;
  }
}

export function getActionLabel(actionType) {
  switch (actionType) {
    case 'CREATE': return 'Création';
    case 'UPDATE': return 'Modification';
    case 'DELETE': return 'Suppression';
    default: return actionType;
  }
}

export function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function getEntityDetails(log) {
  const data = log.new_data || log.old_data;
  if (!data) return '';

  try {
    switch (log.entity_type) {
      case 'member':
        if (!data.first_name) return '';
        return `${data.first_name}${data.last_name ? ' ' + data.last_name : ''}`;
      
      case 'recurring_assignment':
      case 'specific_assignment':
        if (!data.first_name || (!data.weekday && data.weekday !== 0 && !data.date) || !data.slot_type) return '';
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const day = data.weekday !== undefined ? days[data.weekday] : data.date;
        const slot = data.slot_type === 'ouverture' ? 'Ouverture' : 'Fermeture';
        const member = `${data.first_name}${data.last_name ? ' ' + data.last_name : ''}`;
        return `${day} - ${slot} - ${member}`;
      
      case 'absence':
        if (!data.first_name || !data.start_date) return '';
        const memberName = `${data.first_name}${data.last_name ? ' ' + data.last_name : ''}`;
        const period = data.start_date === data.end_date 
          ? new Date(data.start_date).toLocaleDateString('fr-FR')
          : `${new Date(data.start_date).toLocaleDateString('fr-FR')} au ${new Date(data.end_date).toLocaleDateString('fr-FR')}`;
        return `${memberName} - ${period}`;
      
      default:
        return '';
    }
  } catch (error) {
    console.warn('Error processing entity details:', error, data);
    return '';
  }
}


// Process raw audit log to add computed properties
export function processAuditLog(rawLog) {
  return {
    ...rawLog,
    actionIcon: getActionIcon(rawLog.action_type),
    actionColor: getActionColor(rawLog.action_type),
    actionLabel: getActionLabel(rawLog.action_type),
    entityTypeLabel: getEntityTypeLabel(rawLog.entity_type),
    formattedTimestamp: formatTimestamp(rawLog.timestamp),
    entityDetails: getEntityDetails(rawLog)
  };
}

// Actions
export const auditLogActions = {
  async loadLogs(reset = false) {
    try {
      if (reset) {
        currentPage.set(0);
        auditLogs.set([]);
      }
      
      isLoading.set(true);
      
      let page = 0;
      currentPage.subscribe(p => page = p)();
      const offset = (reset ? 0 : page) * PAGE_SIZE;
      
      const response = await fetch(`/api/audit-logs?limit=${PAGE_SIZE}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      
      const newLogs = await response.json();
      
      if (reset) {
        auditLogs.set(newLogs);
      } else {
        auditLogs.update(logs => [...logs, ...newLogs]);
      }
      
      hasMoreLogs.set(newLogs.length === PAGE_SIZE);
      currentPage.update(p => p + 1);
      
    } catch (err) {
      console.error('Error loading audit logs:', err);
      error.set(err.message);
    } finally {
      isLoading.set(false);
    }
  },

  async loadMore() {
    let loading = false;
    let hasMore = false;
    
    isLoading.subscribe(value => loading = value)();
    hasMoreLogs.subscribe(value => hasMore = value)();
    
    if (!loading && hasMore) {
      await this.loadLogs();
    }
  }
};