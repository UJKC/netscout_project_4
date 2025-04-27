import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import areBracketsBalanced, { checkConditions } from '../utility/BrackerOps';
import { isInitialPartialInput, getMatchingValues, getCategoryForComparison, shouldShowComparisonOperators, getMatchingCategories } from '../utility/LCUtility';
import categoryList from '../utility/LCUtility';
import { checkBracketsAndOperators, checkCategoriesForRepetition, hasBrackets, isPatternValid } from '../utility/afterSearch';

const LC = ({ options }) => {
    console.log("Here from LC by SDD. Check last and send Object");
    const [search, setSearchValue] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        const trimmedSearch = search.trim();
        const parts = search.split(/\s+/).filter(Boolean);
        const last = parts[parts.length - 1] || '';
        const secondLast = parts[parts.length - 2] || '';
        const thirdLast = parts[parts.length - 3] || '';
        const lastTwo = parts.slice(-2).join(' ');
        const lastToken = trimmedSearch.split(/\s+/).pop();
        const isSpecialToken = ["AND", "OR", "NOT", "["].includes(lastToken);
        const isSecondLastSpecialToken = ["AND", "OR", "NOT", "["].includes(secondLast);
        const isFirstInputOrPartial = !trimmedSearch || isInitialPartialInput(trimmedSearch.split(/\s+/), lastToken);

        const mappedCategories = categoryList.map((cat, index) => ({
            label: cat,
            value: cat.toLowerCase().replace(/\s+/g, ''),
            id: index + 1,
        }));

        // Case 0: Last token is [
        if (isSpecialToken) {
            setResults(mappedCategories);
            return;
        }

        if (isSecondLastSpecialToken) {
            setResults(getMatchingCategories(lastToken, trimmedSearch));
            return;
        }

        // Case 1: Initial input or partial category
        if (isFirstInputOrPartial) {
            setResults(getMatchingCategories(lastToken, trimmedSearch));
            return;
        }

        // Case 2: Show comparison operators after full category
        if (shouldShowComparisonOperators(last, secondLast, lastTwo, search)) {
            setResults([
                { label: "==", value: "Equal", id: 1 },
                { label: "!=", value: "NEqual", id: 2 },
                { label: "in", value: "NEqual", id: 2 },
            ]);
            return;
        }

        // Case 2.5: Category followed by '==' and then '(' (start of multiple values)
        if (secondLast === "in" && last === "(") {
            const category = parts[parts.length - 3];
            if (categoryList.includes(category)) {
                const values = options[category] || [];
                setResults(values.map((opt, i) => ({ ...opt, id: i })));
                return;
            }
        }

        // Case 2.6: Typing comma inside multi-value list
        if (last === ",") {
            const openParenIndex = parts.lastIndexOf("(");
            const equalIndex = parts.lastIndexOf("in");

            if (openParenIndex > -1 && equalIndex > -1 && openParenIndex > equalIndex) {
                const category = parts[equalIndex - 1];

                if (categoryList.includes(category)) {
                    const alreadyEntered = parts
                        .slice(openParenIndex + 1, parts.length - 1)
                        .map(v => v.replace(/,/g, "").trim())
                        .filter(Boolean);

                    const allOptions = options[category] || [];

                    const filtered = allOptions.filter(opt =>
                        !alreadyEntered.includes(opt.label) &&
                        !alreadyEntered.includes(opt.value) &&
                        !alreadyEntered.includes(String(opt.id))
                    );

                    setResults(filtered.map((opt, i) => ({ ...opt, id: i })));
                    return;
                }
            }
        }



        // Case 3.1: Category followed by == or !=
        if ((last === "==" || last === "!=") && (categoryList.includes(secondLast) || categoryList.includes(lastTwo))) {
            const category = getCategoryForComparison(secondLast, lastTwo);
            const values = options[category] || [];
            setResults(values.map((opt, i) => ({ ...opt, id: i })));
            return;
        }

        // Case 3.2: Typing value after comparison
        if (
            (secondLast === "==" || secondLast === "!=") &&
            (categoryList.includes(thirdLast) || categoryList.includes(parts.slice(-3, -1).join(' ')))
        ) {
            const potentialCategory = categoryList.includes(parts.slice(-3, -1).join(' '))
                ? parts.slice(-3, -1).join(' ')
                : thirdLast;

            const { filtered, isFullySelected } = getMatchingValues(potentialCategory, last.toLowerCase(), options);

            if (isFullySelected) {
                setResults([
                    { label: "AND", value: "AND", id: 100 },
                    { label: "OR", value: "OR", id: 101 },
                    { label: "NOT", value: "NOT", id: 102 },
                ]);
            } else {
                setResults(filtered);
            }
            return;
        }

        // Final fallback: Suggest logical operators
        setResults([
            { label: "AND", value: "AND", id: 100 },
            { label: "OR", value: "OR", id: 101 },
            { label: "NOT", value: "NOT", id: 102 },
        ]);
    }, [search, options]);

    const afterSearch = () => {
        if (!areBracketsBalanced(search)) {
            alert("Please close brackets properly")
            return
        }
        const sqarebrackerdisciplined = checkBracketsAndOperators(search)
        if (!sqarebrackerdisciplined.valid) {
            alert(sqarebrackerdisciplined.error)
            return
        }
        const specialcheck = hasBrackets(search)
        if (specialcheck) {
            console.log("Yess")
        }
        else {
        if (!checkConditions(search)) {
            alert('Add atleast host and application')
            return
        }
        const repeated = checkCategoriesForRepetition(search)
        if (!repeated.valid) {
            alert(repeated.error)
            return
        }
        const validationResult = isPatternValid(search, options);
        if (!validationResult.valid) {
            alert(validationResult.error)
            return
        }
        }

        // // ✅ Passed all validations
        alert("Search is valid!");
    }

    return (
        <>
            <div style={{ display: 'flex' }}>
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
            </div>
            <button type='submit' onClick={() => afterSearch()} />
        </>
    );
};

export default LC;
