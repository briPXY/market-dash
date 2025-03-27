export const decimalTrimmer = (num) => {
    if (num === 0) return "0.00"; // Ensures zero is formatted properly

    let integerDigits = Math.floor(Math.log10(Math.abs(num))) + 1;

    // If it's a small number (e.g., 0.00000850), keep 6 decimal places
    if (integerDigits <= 0) {
        return num.toFixed(6);
    }

    // Otherwise, keep 2 decimal places for larger numbers
    return num.toFixed(2);
};