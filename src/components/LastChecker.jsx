import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';

const LC = ({ options }) => {
    console.log("Here from LC by SDD. Check last and send Object");
    const [search, setSearchValue] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        const trimmedSearch = search.trim();
        const parts = search.split(/\s+/).filter(Boolean); // clean multiple spaces, but keep meaningful structure

        const last = parts[parts.length - 1] || '';
        const secondLast = parts[parts.length - 2] || '';
        const thirdLast = parts[parts.length - 3] || '';
        const lastTwo = parts.slice(-2).join(' ');
        const lastToken = last.toUpperCase();

        // 🌟 Category names
        const categoryList = ["Application", "Port", "Host", "Geolocation", "Host_Group"];

        console.log(last)

        // ✅ Case 1: Initial input or partial category
        const isInitialPartial =
            parts.length === 1 &&
            categoryList.some(
                cat =>
                    cat.toLowerCase().startsWith(last.toLowerCase()) &&
                    cat.toLowerCase() !== last.toLowerCase()
            );

        if (!trimmedSearch || ["AND", "OR", "NOT"].includes(lastToken) || isInitialPartial) {
            const matchedCategories = categoryList
                .filter(
                    cat =>
                        (cat.toLowerCase().startsWith(last.toLowerCase()) &&
                            cat.toLowerCase() !== last.toLowerCase()) ||
                        !trimmedSearch
                )
                .map((cat, index) => ({
                    label: cat,
                    value: cat.toLowerCase().replace(/\s+/g, ''),
                    id: index + 1,
                }));

            setResults(matchedCategories);
            return;
        }

        // ✅ Case 2: If last word (or phrase) is a full category → suggest comparison ops
        const isCategoryWithSpace =
            categoryList.includes(last) && search.endsWith(' ');  // Check the raw search string for space

        const isPartialComparison =
            (categoryList.includes(secondLast) || categoryList.includes(lastTwo));

        // Ensure we don't show == or != if the user has fully typed them
        const hasFullyTypedComparison = last === "==" || last === "!=";

        if ((isCategoryWithSpace || isPartialComparison) && !hasFullyTypedComparison) {
            setResults([
                { label: "==", value: "Equal", id: 1 },
                { label: "!=", value: "NEqual", id: 2 },
            ]);
            return;
        }

        // ✅ Case 3: Typing a value after comparison (Application == 0)
        // ✅ Case 3.1: Just typed == or != after a category (no value typed yet)
        if (
            (last === "==" || last === "!=") &&
            (categoryList.includes(secondLast) || categoryList.includes(lastTwo))
        ) {
            const category = categoryList.includes(lastTwo) ? lastTwo : secondLast;

            if (options[category]) {
                const mapped = options[category].map((opt, i) => ({
                    ...opt,
                    id: i,
                }));
                setResults(mapped);
            } else {
                setResults([]);
            }
            return;
        }

        // ✅ Case 3.2: Category == <value> (so we filter now)
        if (
            (secondLast === "==" || secondLast === "!=") &&
            (categoryList.includes(thirdLast) || categoryList.includes(parts.slice(-3, -1).join(' '))) // check single or two-word category
        ) {
            const potentialCategory = categoryList.includes(parts.slice(-3, -1).join(' '))
                ? parts.slice(-3, -1).join(' ')
                : thirdLast;

            const valueInput = last.toLowerCase();

            if (options[potentialCategory]) {
                const filtered = options[potentialCategory]
                    .filter(opt =>
                        opt.label?.toLowerCase().includes(valueInput) ||
                        opt.value?.toLowerCase().includes(valueInput)
                    )
                    .map((opt, i) => ({
                        ...opt,
                        id: i,
                    }));

                // Optional: If exactly matched, treat as fully selected and show logical ops
                const isFullySelected = options[potentialCategory].some(opt =>
                    opt.label?.toLowerCase() === valueInput ||
                    opt.value?.toLowerCase() === valueInput
                );

                if (isFullySelected) {
                    setResults([
                        { label: "AND", value: "AND", id: 100 },
                        { label: "OR", value: "OR", id: 101 },
                        { label: "NOT", value: "NOT", id: 102 },
                    ]);
                } else {
                    setResults(filtered);
                }
            } else {
                setResults([]);
            }
            return;
        }


        // ✅ Final fallback: Suggest logical ops
        setResults([
            { label: "AND", value: "AND", id: 100 },
            { label: "OR", value: "OR", id: 101 },
            { label: "NOT", value: "NOT", id: 102 },
        ]);
    }, [search, options]);

    return (
        <>
            <CodeEditor options={options} onChange={setSearchValue} optional={search} results={results} />
            {search && <>{search}</>}
            {results.length > 0 && (
                <ul>
                    {results.map((item, index) => (
                        <li key={`${item.id}-${index}`}>
                            {item.label} — {item.value}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};

export default LC;
