/**
 * Computes the correct number of total pages based on a per page number
 * @param totalCount total number of elements we are paging
 * @param perPage number of elements per page
 * @returns how many pages of data total there are
 */
export default function getTotalPages(totalCount: number, perPage: number): number {
    if (Number.isNaN(totalCount) || Number.isNaN(perPage)) {
        throw new TypeError("Parameters must be a number");
    }
    
    if (totalCount == 0 || perPage == 0) {
        return 0;
    }
    else if (totalCount < perPage) {
        return 1;
    }

    return Math.ceil(totalCount / perPage);
}