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