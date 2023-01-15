import getTotalPages from "../../../helperFunctions/pageFunctions.helper";
import { todoLists } from "../../../mockData/todoList.data";
import Page from "../../../models/Page";
import TodoList from "../../../models/todoList/TodoList.model";

/**
 * Mocks the createNewList function on the TodoListDAO
 * @param name list name
 * @param createdBy list creator (user id)
 * @param shouldResolve if we should return succuessfully, or throw an error
 * @returns Promise containing a fake TodoList; else, throws an error
 */
export function mockCreateNewList(name: string, createdBy: number, shouldResolve: boolean): Promise<TodoList> {
    if (shouldResolve) {
        return Promise.resolve({
            id: 1,
            name,
            createdOnDate: new Date(),
            lastUpdatedDate: new Date(),
            createdBy
        });
    }
    
    return Promise.reject("Mocking a SQL Error");
}

/**
 * Mocks the getListByPage function on the TodoListDAO
 * @param userId user AKA creator Id
 * @param page page we are fetching
 * @param perPage how many elements per page we want
 * @param shouldResolve if we should return successfully, or return an error
 * @returns Promise with a fake page object; otherwise, an error
 */
export function mockGetListByPage(userId: number, page: number, perPage: number, shouldResolve: boolean): Promise<Page<TodoList>> {
    if (shouldResolve) {
        const listsForUser = todoLists.filter((list) => {
            return list.createdBy === userId;
        });

        return Promise.resolve({
            page: page,
            perPage: perPage,
            totalPages: getTotalPages(listsForUser.length, perPage),
            data: listsForUser
        });
    }

    return Promise.reject("Mocking a SQL error");
}

/**
 * Mocks the updateListById function on the TodoListDAO
 * @param id list id
 * @param name list name
 * @param shouldResolve if we should return succuessfully, or throw an error
 * @returns Promise containing a fake TodoList; else, throws an error
 */
export function mockUpdateListById(id: number, name: string, shouldResolve: boolean): Promise<TodoList | undefined> {
    if (shouldResolve) {
        return Promise.resolve({
            id,
            name,
            createdOnDate: new Date(),
            lastUpdatedDate: new Date(),
            createdBy: 1
        });
    }
    
    return Promise.resolve(undefined);
}

/**
 * Mocks the deleteListById method on the TodoListDAO
 * @param Id list id
 * @param shouldBeSuccessful if we should indicate a successsful delete, or not
 * @returns Promise containing a boolean if it was succssful or not
 */
export function mockDeleteListById(Id: number, shouldBeSuccessful: boolean) {
    return Promise.resolve(shouldBeSuccessful);
}