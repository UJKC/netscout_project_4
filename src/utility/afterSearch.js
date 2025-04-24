const categoryList = ["Application", "Port", "Host", "Geolocation", "Host_Group"];
const comparisonOperators = ["==", "!="];
const logicalOperators = ["AND", "OR"];
const categoriesWithValueValidation = ["Application", "Geolocation", "Host_Group"];

function isValidValueForCategory(category, value, options) {
    const categoryOptions = options[category];
    if (!categoryOptions || !Array.isArray(categoryOptions)) {
        return false;
    }

    return categoryOptions.some(opt => opt.label === value || opt.value === value || opt.id === value);
}

export function isPatternValid(search, options) {
    const tokens = search.trim().split(/\s+/);
    if (tokens.length < 3) {
        return { valid: false, error: "Pattern too short. Expected format: <Category> <Operator> <Value>" };
    }

    let i = 0;
    while (i < tokens.length) {
        const category = tokens[i];
        const operator = tokens[i + 1];
        const value = tokens[i + 2];

        // Validate category
        if (!categoryList.includes(category)) {
            return { valid: false, error: `Invalid category "${category}". Allowed categories: ${categoryList.join(", ")}` };
        }

        // Validate comparison operator
        if (!comparisonOperators.includes(operator)) {
            return { valid: false, error: `Invalid comparison operator "${operator}". Use '==' or '!='.` };
        }

        // Validate value presence
        if (!value) {
            return { valid: false, error: `Missing value for category "${category}".` };
        }

        // Validate value for specific categories
        if (categoriesWithValueValidation.includes(category)) {
            const isValid = isValidValueForCategory(category, value, options);
            if (!isValid) {
                return {
                    valid: false,
                    error: `Invalid value "${value}" for category "${category}".`
                };
            }
        }

        i += 3;

        // If more tokens exist, validate logical operator
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
