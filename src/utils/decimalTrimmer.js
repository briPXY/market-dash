
export const decimalTrimmer = (num) => {
    let integerDigits = num === 0 ? 1 : Math.floor(Math.log10(Math.abs(num))) + 1;
    return integerDigits === 1 ? num.toFixed(4) : num.toFixed(2);
}