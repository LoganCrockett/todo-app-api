import { PostgresError } from "postgres";
import TodoListDAO from "../../dao/todoList.dao";
import { todoLists } from "../../mockData/todoList.data";
import { users } from "../../mockData/users.data";
import TodoList from "../../models/todoList/TodoList.model";
import { insertTodoLists, insertUsersAndCredentials, removeTodoLists, removeUsersAndCredentials } from "../mocks/db.setup";

beforeEach(async () => {
    await insertUsersAndCredentials();
    await insertTodoLists();
});

afterEach(async () => {
    await removeTodoLists();
    await removeUsersAndCredentials();
});

describe("Todo List DAO Tests (Valid)", () => {
    test.each(users)("Creating a New List (Valid)", async (user) => {
        const newListData = {
            name: "Example List Name",
            createdBy: user.id
        };

        await TodoListDAO.createNewList(newListData.name, newListData.createdBy)
        .then((res: TodoList) => {
            expect(res).toBeDefined();
            expect(res.id).toBeGreaterThan(0);
            expect(res.name).toMatch(newListData.name);
            expect(res.createdOnDate).toBeDefined();
            expect(res.lastUpdatedDate).toBeDefined();
            expect(res.createdBy).toEqual(user.id);
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        });
    });

    test.each(todoLists)("Getting List by Id (Valid)", async (list) => {
        await TodoListDAO.getListById(list.id)
        .then((res: TodoList) => {
            expect(res).toBeDefined();

            expect(res.id).toEqual(list.id);
            expect(res.createdBy).toEqual(list.createdBy);
            expect(res.name).toEqual(list.name);
            expect(res.createdOnDate).toBeDefined();
            expect(res.lastUpdatedDate).toBeDefined();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    });

    test.each(todoLists)("Updating List by Id (Valid)", async (list) => {
        await TodoListDAO.updateListById(list.id, "Testing List Not Present")
        .then((res: TodoList) => {
            expect(res).toBeDefined();
            expect(res.id).toEqual(list.id);
            expect(res.createdBy).toEqual(list.createdBy);
            expect(res.lastUpdatedDate).toBeDefined();
            expect(res.lastUpdatedDate.getTime()).not.toEqual(list.createdOnDate.getTime())
            expect(res.createdOnDate).toBeDefined();
            expect(res.name).not.toMatch(list.name);
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    });

    test.each(todoLists)("Deleting List by Id (Valid)", async (list) => {
        await TodoListDAO.deleteListById(list.id)
        .then((res: boolean) => {
            expect(res).toBeTruthy();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        });
    })
});

describe("Todo List DAO Tests (Invalid)", () => {
    test("Getting List by Id (Not Found)", async () => {
        await TodoListDAO.getListById(-1)
        .then((res: TodoList) => {
            expect(res).toBeUndefined();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    });

    test("Updating List by Id (Not Found)", async () => {
        await TodoListDAO.updateListById(-1, "Testing List Not Present")
        .then((res: TodoList) => {
            expect(res).toBeUndefined();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    })

    test("Deleting List by Id (Not Found)", async () => {
        await TodoListDAO.deleteListById(-1)
        .then((res: boolean) => {
            expect(res).toBeFalsy();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    })
});