const areBracketsBalanced = (input) => {
    const stack = [];
    const bracketPairs = {
        ')': '(',
        '}': '{',
        ']': '['
    };

    for (let char of input) {
        if (['(', '{', '['].includes(char)) {
            stack.push(char);
        } else if ([')', '}', ']'].includes(char)) {
            if (stack.pop() !== bracketPairs[char]) {
                return false;
            }
        }
    }

    return stack.length === 0;
}

export function checkConditions(str) {
    const hasHost =
        str.includes('Host ==') || str.includes('Host !=') || str.includes('Host in') ||
        str.includes('Host_Group ==') || str.includes('Host_Group !=') || str.includes('Host_Group in') ||
        str.includes('Geolocation ==') || str.includes('Geolocation !=') || str.includes('Geolocation in');

    const hasAppOrPort =
        str.includes('Application ==') || str.includes('Application !=') || str.includes('Application in') ||
        str.includes('Port ==') || str.includes('Port !=') || str.includes('Port in');

    return hasHost && hasAppOrPort;
}


export default areBracketsBalanced;