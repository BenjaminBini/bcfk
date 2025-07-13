// Utility functions for name display logic

/**
 * Generate unique display names for members
 * Shows only first names, but adds last name letters as differentiators if needed
 * @param {Array} members - Array of member objects with first_name and last_name
 * @returns {Array} Array of members with display_name property added
 */
function generateDisplayNames(members) {
  // Group members by first name
  const firstNameGroups = {};
  
  members.forEach(member => {
    const firstName = member.first_name;
    if (!firstNameGroups[firstName]) {
      firstNameGroups[firstName] = [];
    }
    firstNameGroups[firstName].push(member);
  });
  
  // Generate display names
  const result = [];
  
  Object.keys(firstNameGroups).forEach(firstName => {
    const group = firstNameGroups[firstName];
    
    if (group.length === 1) {
      // Only one person with this first name
      result.push({
        ...group[0],
        display_name: firstName
      });
    } else {
      // Multiple people with same first name - need differentiators
      const withDifferentiators = generateDifferentiators(group);
      result.push(...withDifferentiators);
    }
  });
  
  return result;
}

/**
 * Generate differentiators for members with the same first name
 * @param {Array} members - Array of members with same first name
 * @returns {Array} Array of members with display_name property
 */
function generateDifferentiators(members) {
  // Sort by last name to ensure consistent ordering
  const sorted = members.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''));
  
  // Try different levels of differentiation
  for (let level = 1; level <= 10; level++) {
    const names = sorted.map(member => {
      const lastName = member.last_name || '';
      const differentiator = lastName.substring(0, level);
      return differentiator ? `${member.first_name} ${differentiator}.` : member.first_name;
    });
    
    // Check if all names are unique at this level
    const uniqueNames = new Set(names);
    if (uniqueNames.size === names.length) {
      // All names are unique, return the result
      return sorted.map((member, index) => ({
        ...member,
        display_name: names[index]
      }));
    }
  }
  
  // Fallback: use full names if we can't make them unique with abbreviations
  return sorted.map(member => ({
    ...member,
    display_name: member.last_name ? `${member.first_name} ${member.last_name}` : member.first_name
  }));
}

/**
 * Apply display names to data that contains member information
 * @param {Array} data - Array of objects containing member data
 * @param {Array} members - Array of all members with display names
 * @param {string} memberIdField - Field name containing member ID
 * @param {string} displayField - Field name to set with display name
 * @returns {Array} Data with display names applied
 */
function applyDisplayNames(data, members, memberIdField = 'member_id', displayField = 'display_name') {
  const memberDisplayMap = {};
  members.forEach(member => {
    memberDisplayMap[member.id] = member.display_name;
  });
  
  return data.map(item => ({
    ...item,
    [displayField]: memberDisplayMap[item[memberIdField]] || item.member_name || 'Unknown'
  }));
}

module.exports = {
  generateDisplayNames,
  applyDisplayNames
};