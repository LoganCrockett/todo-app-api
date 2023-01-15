/**
 * Model for representing a paged result
 */
export default interface Page<t> {
    page: number;
    perPage: number;
    totalPages: number;
    data: t
};