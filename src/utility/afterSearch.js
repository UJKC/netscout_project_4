const categoryList = ["Application", "Port", "Host", "Geolocation", "Host_Group"];
const comparisonOperators = ["==", "!="];
const logicalOperators = ["AND", "OR"];

export function isPatternValid(search) {
    const tokens = search.trim().split(/\s+/);
    if (tokens.length < 3) return false;

    let i = 0;
    while (i < tokens.length) {
        const category = tokens[i];
        const operator = tokens[i + 1];
        const value = tokens[i + 2];

        // Validate category
        if (!categoryList.includes(category)) {
            return false;
        }

        // Validate comparison operator
        if (!comparisonOperators.includes(operator)) {
            return false;
        }

        // Value: we don't validate contents, just presence
        if (!value) {
            return false;
        }

        i += 3;

        // If there’s more, the next must be a logical operator
        if (i < tokens.length) {
            const logic = tokens[i];
            if (!logicalOperators.includes(logic)) {
                return false;
            }
            i += 1; // move past the logic operator
        }
    }

    return true;
}
