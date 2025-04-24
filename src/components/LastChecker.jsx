import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import areBracketsBalanced, { checkConditions } from '../utility/BrackerOps';
import { isInitialPartialInput, getMatchingValues, getCategoryForComparison, shouldShowComparisonOperators, getMatchingCategories } from '../utility/LCUtility';
import categoryList from '../utility/LCUtility';

const LC = ({ options }) => {
    console.log("Here from LC by SDD. Check last and send Object");
    const [search, setSearchValue] = useState('');
    const [results, setResults] = useState([]);
    const [error, setErrorMessage] = useState('')

    useEffect(() => {
        const trimmedSearch = search.trim();
        const parts = search.split(/\s+/).filter(Boolean);
    
        const last = parts[parts.length - 1] || '';
        const secondLast = parts[parts.length - 2] || '';
        const thirdLast = parts[parts.length - 3] || '';
        const lastTwo = parts.slice(-2).join(' ');
        const lastToken = last.toUpperCase();
    
        // Case 1: Initial input or partial category
        if (!trimmedSearch || ["AND", "OR", "NOT"].includes(lastToken) || isInitialPartialInput(parts, last)) {
            setResults(getMatchingCategories(last, trimmedSearch));
            return;
        }
    
        // Case 2: Show comparison operators after full category
        if (shouldShowComparisonOperators(last, secondLast, lastTwo, search)) {
            setResults([
                { label: "==", value: "Equal", id: 1 },
                { label: "!=", value: "NEqual", id: 2 },
            ]);
            return;
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
        }
        if (!checkConditions(search)) {
            alert('Add atleast host and application')
        }
    }

    return (
        <>
            <div style={{display: 'flex'}}>
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
            <textarea value={error} />
        </>
    );
};

export default LC;
