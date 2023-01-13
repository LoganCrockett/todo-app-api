/**
 * Model for the TodoList table in the DB
 */
export default interface TodoList {
    id: number;
    name: string;
    createdOnDate: Date;
    lastUpdatedDate: Date;
    createdBy: number; // User Id
}