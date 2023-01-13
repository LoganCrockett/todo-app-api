import TodoList from "../models/todoList/TodoList.model";
import sql from "../db";

/**
 * Stores basic functions needed to perform CRUD operations on the DB for
 * a todo list
 */
export default class TodoListDAO {

    /**
     * Creates a new list
     * @param name list name
     * @param createdBy id of user who is creating the list
     * @returns Promise containing the New list object
     */
    public static async createNewList(name: string, createdBy: number): Promise<TodoList> {
        return await sql.begin(async () => {
            const [newList] = await sql<TodoList[]>`
            insert into todo.list (name, "createdOnDate", "lastUpdatedDate", "createdBy")
            values (
                ${name}, now(), now(), ${createdBy}
                )
            returning id, name, "createdOnDate", "lastUpdatedDate", "createdBy"
            `;

            return newList;
        });
    }

    /**
     * Get's a list by id
     * @param id list id
     * @returns Promise containg the list object; oterwise, undefined
     */
    public static async getListById(id: number): Promise<TodoList> {
        return await sql.begin(async () => {
            const [list] = await sql<TodoList[]>`select * from todo.list l where l.id = ${id}`;

            return list;
        });
    }

    /**
     * Updates a list by id
     * @param id list id
     * @param newName new list name
     * @returns Promise containg the new list object; otherwise, undefined
     */
    public static async updateListById(id: number, newName: string): Promise<TodoList> {
        return await sql.begin(async () => {
            const [updatedList] = await sql<TodoList[]>`
            update todo.list l set
            name = ${newName}, "lastUpdatedDate" = now()
            where id = ${id}
            returning l.*
            `;

            return updatedList;
        });
    }

    /**
     * Deletes a list by id
     * @param id list id
     * @returns Promise containing a boolean value if it was successful or not
     */
    public static async deleteListById(id: number): Promise<boolean> {
        return await sql.begin(async () => {
            const res = await sql`
            delete from todo.list
            where id = ${id}`;

            return res.count === 1;
        });
    }
}