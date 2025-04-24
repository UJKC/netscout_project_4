const categoryList = ["Application", "Port", "Host", "Geolocation", "Host_Group"];

export const isInitialPartialInput = (parts, last) => {
    return (
        parts.length === 1 &&
        categoryList.some(cat =>
            cat.toLowerCase().startsWith(last.toLowerCase()) &&
            cat.toLowerCase() !== last.toLowerCase()
        )
    );
};

export const getMatchingCategories = (last, trimmedSearch) => {
    return categoryList
        .filter(cat =>
            (cat.toLowerCase().startsWith(last.toLowerCase()) &&
                cat.toLowerCase() !== last.toLowerCase()) ||
            !trimmedSearch
        )
        .map((cat, index) => ({
            label: cat,
            value: cat.toLowerCase().replace(/\s+/g, ''),
            id: index + 1,
        }));
};

export const shouldShowComparisonOperators = (last, secondLast, lastTwo, search) => {
    const isCategoryWithSpace = categoryList.includes(last) && search.endsWith(' ');
    const isPartialComparison = categoryList.includes(secondLast) || categoryList.includes(lastTwo);
    const hasFullyTypedComparison = last === "==" || last === "!=";

    return (isCategoryWithSpace || isPartialComparison) && !hasFullyTypedComparison;
};

export const getCategoryForComparison = (secondLast, lastTwo) => {
    return categoryList.includes(lastTwo) ? lastTwo : secondLast;
};

export const getMatchingValues = (category, valueInput, options) => {
    const values = options[category] || [];
    const filtered = values
        .filter(opt =>
            opt.label?.toLowerCase().includes(valueInput) ||
            opt.value?.toLowerCase().includes(valueInput)
        )
        .map((opt, i) => ({
            ...opt,
            id: i,
        }));

    const isFullySelected = values.some(opt =>
        opt.label?.toLowerCase() === valueInput ||
        opt.value?.toLowerCase() === valueInput
    );

    return { filtered, isFullySelected };
};

export default categoryList