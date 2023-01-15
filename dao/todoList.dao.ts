import TodoList from "../models/todoList/TodoList.model";
import sql from "../db";
import Page from "../models/Page";
import getTotalPages from "../helperFunctions/pageFunctions.helper";

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
     * Get's a page of lists created by the user (Ordered by lastUpdatedDate)
     * @param userId user id AKA the creator
     * @param page page we are fetching
     * @param perPage number of elements to grab per page
     * @returns Promise containg the page of lists; otherwise, undefined
     */
    public static async getListByPage(userId: number, page: number, perPage: number): Promise<Page<Array<TodoList>>> {
        return await sql.begin(async () => {
            // Note: Subtract one from the page in order to crrectly grab all data
            const list = await sql<TodoList[]>`
            select * from todo.list l
            where l."createdBy" = ${userId}
            order by "lastUpdatedDate" desc
            limit ${perPage} offset ${(page - 1) * perPage}
            `;

            const [count] = await sql<any>`
            select count(*) from todo.list l
            where l."createdBy" = ${userId}
            `;

            const pagedData: Page<Array<TodoList>> = {
                page,
                perPage,
                totalPages: getTotalPages(count.count, perPage),
                data: list
            };

            return pagedData;
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