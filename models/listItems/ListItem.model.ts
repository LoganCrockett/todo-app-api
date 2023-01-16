/**
 * Model for the listItems table in the DB
 */
export default interface ListItem {
    id: number;
    listId: number;
    description: string;
    createdOnDate: Date;
}