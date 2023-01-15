/**
 * Checks if a given string is valid (Defined, and at least one character)
 * @param toCheck string to check
 * @returns true if it is valid, else false
 */
export const checkStringValidity = (toCheck: string): boolean => {
    return toCheck !== undefined && toCheck !== null && toCheck !== "undefined" && toCheck !== "null" && toCheck.length > 1;
}