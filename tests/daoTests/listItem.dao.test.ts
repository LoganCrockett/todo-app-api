import { PostgresError } from "postgres";
import ListItemDAO from "../../dao/listItem.dao";
import { listItems } from "../../mockData/listItems.data";
import { todoLists } from "../../mockData/todoList.data";
import ListItem from "../../models/listItems/ListItem.model";
import { insertTodoListItems, insertTodoLists, insertUsersAndCredentials, removeTodoListItems, removeTodoLists, removeUsersAndCredentials } from "../mocks/db.setup";

beforeEach(async () => {
    await insertUsersAndCredentials();
    await insertTodoLists();
    await insertTodoListItems();
});

afterEach(async () => {
    await removeTodoListItems();
    await removeTodoLists();
    await removeUsersAndCredentials();
});

describe("List Item DAO Tests (Valid)", () => {
    test.each(todoLists)("Creating a New List Item (Valid)", async (list) => {
        await ListItemDAO.createListItem(list.id, "Example Text")
        .then((res) => {
            expect(res).toBeDefined();
            expect(res.id).toBeDefined();
            expect(res.listId).toEqual(list.id);
            expect(res.description).toMatch("Example Text");
            expect(res.createdOnDate).toBeDefined();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    });

    test.each(todoLists)("Getting List Items by list Id (Items Found)", async (list) => {
        const listItemsToTest = listItems.filter((item) => {
            return item.listId === list.id
        });

        await ListItemDAO.getListItemsByListId(list.id)
        .then((res: ListItem[]) => {
            expect(res).toBeDefined();
            expect(res.length).toEqual(listItemsToTest.length);
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    });

    test.each(listItems)("Updating a List Item (Valid)", async (item) => {
        await ListItemDAO.updateListItemById(item.id, "new description")
        .then((res) => {
            expect(res).toBeDefined();

            expect(res.id).toEqual(item.id)
            expect(res.description).toMatch("new description");
            expect(res.listId).toEqual(item.listId);
            expect(res.createdOnDate).toBeDefined();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    });

    test.each(listItems)("Deleting a List Item (Valid)", async (item) => {
        await ListItemDAO.deleteListItemById(item.id)
        .then((res: boolean) => {
            expect(res).toBeTruthy();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    });
});

describe("List Item DAO Tests (Invalid)", () => {
    test("Getting List Items by List Id (No Items Found)", async () => {
        await ListItemDAO.getListItemsByListId(-1)
        .then((res: ListItem[]) => {
            expect(res).toBeDefined();
            expect(res.length).toEqual(0);
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    });

    test("Updating a List Item (No Item Present)", async () => {
        await ListItemDAO.updateListItemById(-1, "newDescription")
        .then((res) => {
            expect(res).toBeUndefined();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    });

    test("Deleting a List Item (Not Present)", async () => {
        await ListItemDAO.deleteListItemById(-1)
        .then((res: boolean) => {
            expect(res).toBeFalsy();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    });
});