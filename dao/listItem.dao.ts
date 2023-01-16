import sql from "../db";
import ListItem from "../models/listItems/ListItem.model";

/**
 * Static class providing functions to perform CRUD operations for List Items
 * in the DB
 */
export default class ListItemDAO {
    /**
     * Creates a new item in a list, and updates the lastUpdatedDate for a list
     * @param listId list we are adding an item to
     * @param description item description
     * @returns Proise containing the new ListItem; otherwise, throws an error
     */
    public static async createListItem(listId: number, description: string): Promise<ListItem> {
        return await sql.begin(async () => {
            const [item] = await sql<ListItem[]>`
            insert into todo."listItems" ("listId", description, "createdOnDate")
            values (${listId}, ${description}, now())
            returning id, "listId", description, "createdOnDate"`;

            await sql`
            update todo.list
            set "lastUpdatedDate" = now()
            where id = ${listId}`;

            return item;
        });
    }

    /**
     * Gets an array of list items, based on the list id
     * @param listId list id of the item(s)
     * @returns Promise containing an array of list items
     */
    public static async getListItemsByListId(listId: number): Promise<Array<ListItem>> {
        return await sql.begin(async () => {
            return await sql<ListItem[]>`
            select * from todo."listItems" li
            where li."listId" = ${listId}
            order by "createdOnDate" asc`;
        });
    }

    /**
     * Updates a list item by its id
     * @param id item id
     * @param newDescription new description we are assigning the item
     * @returns Promise containing the update list item, or undefined
     */
    public static async updateListItemById(id: number, newDescription: string): Promise<ListItem> {
        return await sql.begin(async () => {
            const [updatedItem] = await sql<ListItem[]>`
            update todo."listItems" li
            set description = ${newDescription}
            where id = ${id}
            returning li.*
            `;

            return updatedItem;
        });
    }

    /**
     * Deletes a List Item by Id
     * @param id list item id
     * @returns Promise containing a boolean if it was successful or not
     */
    public static async deleteListItemById(id: number): Promise<boolean> {
        return await sql.begin(async () => {
            const result = await sql`
            delete from todo."listItems"
            where id = ${id}`;

            return result.count === 1;
        });
    }
}