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
