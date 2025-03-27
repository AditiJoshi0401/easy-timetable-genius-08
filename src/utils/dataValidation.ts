
/**
 * Checks for and filters out duplicate items from an array based on a specified field
 * @param items Array of items to check for duplicates
 * @param field Field to use for duplicate checking
 * @param secondaryField Optional secondary field (like email) for additional duplicate checking
 * @returns Array with duplicates removed
 */
export const checkForDuplicates = (
  items: any[], 
  field: string, 
  secondaryField?: string
): any[] => {
  const existingValues = new Map();
  const uniqueItems = [];
  
  for (const item of items) {
    const value = typeof item[field] === 'string' 
      ? item[field].toLowerCase().trim() 
      : item[field];
    
    // Check secondary field (e.g., email for teachers)
    if (secondaryField && item[secondaryField]) {
      const secondaryValue = item[secondaryField].toLowerCase().trim();
      if (existingValues.has(secondaryValue)) {
        console.log(`Duplicate ${secondaryField} found: ${secondaryValue}`);
        continue;
      }
      existingValues.set(secondaryValue, true);
    }
    
    if (value && !existingValues.has(value)) {
      existingValues.set(value, true);
      uniqueItems.push(item);
    } else if (value) {
      console.log(`Duplicate ${field} found: ${value}`);
    }
  }
  
  return uniqueItems;
};

/**
 * Generate a human-readable timetable name
 */
export const generateTimetableName = (
  streamName?: string, 
  yearValue?: string, 
  divisionName?: string
): string => {
  let displayName = "Timetable";
  
  if (streamName) {
    displayName = streamName;
    if (yearValue) {
      displayName += ` Year ${yearValue}`;
      if (divisionName) {
        displayName += ` ${divisionName}`;
      }
    }
  }
  
  return displayName;
};
