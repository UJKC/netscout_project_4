const categoryList = ["Application", "Port", "Host", "Geolocation", "Host_Group"];
const comparisonOperators = ["==", "!=", "in"];
const logicalOperators = ["AND", "OR"];
const categoriesWithValueValidation = ["Application", "Geolocation", "Host_Group"];

// Checks if a single value is valid for a given category
function isValidValueForCategory(category, value, options) {
    const categoryOptions = options[category];
    if (!categoryOptions || !Array.isArray(categoryOptions)) return false;

    return categoryOptions.some(opt =>
        opt.label === value || opt.value === value || opt.id === value
    );
}

// Checks all values in a list (used for "in (...)")
function areAllValuesValidForCategory(category, values, options) {
    return values.every(value => isValidValueForCategory(category, value.trim(), options));
}

// Parses values wrapped in parentheses (e.g., "(A,B,C)" => ["A", "B", "C"])
function parseParenthesizedValues(valueString) {
    const trimmed = valueString.trim();
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        return trimmed.slice(1, -1).split(',').map(v => v.trim()).filter(Boolean);
    }
    return null;
}

// Main validation function
export function isPatternValid(search, options) {
    const tokens = search.trim().split(/\s+/);
    if (tokens.length < 3) {
        return { valid: false, error: "Pattern too short. Expected format: <Category> <Operator> <Value>" };
    }

    let i = 0;
    while (i < tokens.length) {
        const category = tokens[i];
        const operator = tokens[i + 1];
        let value = tokens[i + 2];

        // Category check
        if (!categoryList.includes(category)) {
            return { valid: false, error: `Invalid category "${category}". Allowed categories: ${categoryList.join(", ")}` };
        }

        // Operator check
        if (!comparisonOperators.includes(operator)) {
            return { valid: false, error: `Invalid comparison operator "${operator}". Use one of: ${comparisonOperators.join(", ")}` };
        }

        if (!value) {
            return { valid: false, error: `Missing value for category "${category}".` };
        }

        // Special handling for "in (...)"
        if (operator === "in") {
            let combinedValue = value;
            if (!value.startsWith("(")) {
                return { valid: false, error: `Expected '(' after 'in' operator.` };
            }

            // Combine tokens until we find one ending in ')'
            while (!combinedValue.endsWith(")") && i + 3 < tokens.length) {
                combinedValue += " " + tokens[i + 3];
                i++;
            }

            const valuesList = parseParenthesizedValues(combinedValue);
            if (!valuesList) {
                return { valid: false, error: `Invalid syntax for 'in' operator. Use: in (value1,value2,...)` };
            }

            if (categoriesWithValueValidation.includes(category)) {
                if (!areAllValuesValidForCategory(category, valuesList, options)) {
                    return {
                        valid: false,
                        error: `One or more values in "${combinedValue}" are invalid for category "${category}".`
                    };
                }
            }

            i += 3; // skip category, operator, and value group

        } else {
            // Regular == or != case
            if (categoriesWithValueValidation.includes(category)) {
                if (!isValidValueForCategory(category, value, options)) {
                    return {
                        valid: false,
                        error: `Invalid value "${value}" for category "${category}".`
                    };
                }
            }
            i += 3;
        }

        // Check logical operator if more tokens exist
        if (i < tokens.length) {
            const logic = tokens[i];
            if (!logicalOperators.includes(logic)) {
                return { valid: false, error: `Invalid logical operator "${logic}". Use 'AND' or 'OR'.` };
            }
            i += 1;
        }
    }

    return { valid: true };
}

export const checkCategoriesForRepetition = (searchString) => {
    // Regex to find tokens that match '==', '!=', or 'in' preceded by a word-like category
    const regex = /(\w+)\s*(==|!=|in)/g;
    const categories = [];
    let match;

    // Find all instances where a category is used with '==', '!=', or 'in'
    while ((match = regex.exec(searchString)) !== null) {
        categories.push(match[1]); // match[1] is the category (word before the operator)
    }

    // Count occurrences of each category
    const categoryCount = categories.reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    // Find categories that are repeated
    const repeatedCategories = Object.keys(categoryCount).filter(category => categoryCount[category] > 1);

    // Return result if there are repeated categories
    if (repeatedCategories.length > 0) {
        return { valid: false, error: `The following categories are repeated: ${repeatedCategories.join(', ')}` };
    }
    else {
        return { valid: true };
    }
};


export const checkBracketsAndOperators = (inputString) => {
    // Step 1: Check for balanced square brackets
    const bracketBalanceRegex = /\[|\]/g;
    const bracketCount = (inputString.match(bracketBalanceRegex) || []).length;

    if (bracketCount % 2 !== 0) {
        return { valid: false, error: "Unmatched brackets found." };
    }

    // Step 2: Find all the square-bracketed sections in the input string
    const bracketedSections = inputString.match(/\[.*?\]/g) || [];

    // Step 3: Check if there are at least two bracketed sections
    if (bracketedSections.length > 1) {
        // Step 4: Check that the sections between brackets have a logical operator (AND, OR, NOT)
        const operatorCheckRegex = /\b(AND|OR|NOT)\b/i;

        for (let i = 0; i < bracketedSections.length - 1; i++) {
            // If there's no logical operator between the current and the next bracketed section
            if (!operatorCheckRegex.test(inputString.slice(inputString.indexOf(bracketedSections[i]) + bracketedSections[i].length, inputString.indexOf(bracketedSections[i + 1])))) {
                return { valid: false, error: "Missing logical operator ('AND', 'OR', 'NOT') between brackets." };
            }
        }
    }

    // If all checks pass
    return { valid: true };
};

export function hasBrackets(str) {
    return str.includes('[') && str.includes(']');
}

export function extractStringsInBrackets(str) {
    const result = [];
    const regex = /\[(.*?)\]/g;
    let match;

    while ((match = regex.exec(str)) !== null) {
        result.push(match[1]); // match[1] is the content inside []
    }

    return result;
}

export function removeContentBetweenBrackets(text) {
    let cleanedText = text.replace(/\[.*?\]/g, '');

    // Trim leading and trailing whitespace
    cleanedText = cleanedText.trim();

    // Remove leading AND, OR, NOT (case-insensitive)
    cleanedText = cleanedText.replace(/^(\s*(AND|OR|NOT)\s*)+/, '');

    // Remove trailing AND, OR, NOT (case-insensitive)
    cleanedText = cleanedText.replace(/(\s*(AND|OR|NOT)\s*)+$/, '');

    return cleanedText.trim(); // Trim again to remove any potential extra whitespace
}

export function findCategoriesInExtractedStrings(extractedStrings) {
    const matchedCategories = []; // This is the array where we store the matches
    for (const extracted of extractedStrings) {
        const trimmedLowerExtracted = extracted.trim().toLowerCase();
        const foundCategory = categoryList.find(
            (category) => category.toLowerCase() === trimmedLowerExtracted
        );
        if (foundCategory) {
            matchedCategories.push(foundCategory); // We push the matching category into the array
        }
    }
    return matchedCategories; // The function returns the array of matched categories
}

export function checkConditionsAndAlertConditional(str, foundCategories) {
    const hasHost = checkCategoryPresence(str, ['Host', 'Host_Group', 'Geolocation']);
    const hasAppOrPort = checkCategoryPresence(str, ['Application', 'Port']);
  
    if (hasHost && hasAppOrPort) {
      return true; // Both conditions are met
    } else if (!hasHost) {
      // Host group is missing in str, check if any Host category is in foundCategories
      const hasFoundHostCategory = foundCategories.some(cat =>
        ['Host', 'Host_Group', 'Geolocation'].some(hostCat => cat.toLowerCase() === hostCat.toLowerCase())
      );
      if (!hasFoundHostCategory) {
        alert('Add at least Host/Host_Group/Geolocation');
      }
      return false;
    } else if (!hasAppOrPort) {
      // App/Port group is missing in str, check if any App/Port category is in foundCategories
      const hasFoundAppOrPortCategory = foundCategories.some(cat =>
        ['Application', 'Port'].some(appPortCat => cat.toLowerCase() === appPortCat.toLowerCase())
      );
      if (!hasFoundAppOrPortCategory) {
        alert('Add at least Application/Port');
      }
      return false;
    }
    return false; // Should not reach here if the conditions are handled correctly above
  }
  
  function checkCategoryPresence(str, categories) {
    return categories.some(category =>
      str.includes(`${category} ==`) ||
      str.includes(`${category} !=`) ||
      str.includes(`${category} in`)
    );
  }
  