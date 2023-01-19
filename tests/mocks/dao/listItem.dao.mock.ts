import ListItemDAO from "../../../dao/listItem.dao";
import { listItems } from "../../../mockData/listItems.data";
import ListItem from "../../../models/listItems/ListItem.model";

/**
 * Mocks the createNewListItem on the ListItemDAO for testing
 * @param listId list id
 * @param description item description
 * @param shouldResolve if we should return successfully, or mock an error
 * @returns Promise containg a fake ListItem, or an error
 */
export function mockCreateNewListItem(listId: number, description: string, shouldResolve: boolean): Promise<ListItem> {
    if (shouldResolve) {
        return Promise.resolve({
            id: 1,
            description,
            listId,
            createdOnDate: new Date()
        });
    }

    return Promise.reject("Mocking a SQL error");
}

/**
 * Mocks the getListItemsByListId method on the ListItemDAO for testing
 * @param listId list id
 * @param shouldResolve if we should return successfully, or mock an error
 * @returns Promise containing fake listItems for a list, or an error
 */
export function mockGetListItemsByListId(listId: number, shouldResolve: boolean) {
    if (shouldResolve) {
        const itemsForList = listItems.filter((item) => {
            return item.listId === listId;
        });

        return Promise.resolve(itemsForList);
    }

    return Promise.reject("Mocking a SQL error");
}

/**
 * Mocks the updateListItembyId method on the ListItemDAO for testing
 * @param itemId item id
 * @param newDescription updated item description
 * @param shouldResolve if we should successfully return, or mock an error
 * @returns Promise containing either an updated list Item object, undefied, or an error
 */
export function mockUpdateListItemById(itemId: number, newDescription: string, shouldResolve: boolean) {
    if (shouldResolve) {
        const findIndex = listItems.findIndex((item) => {
            return item.id === itemId;
        });

        if (findIndex < 0) {
            return Promise.resolve(undefined);
        }

        return Promise.resolve({
            ...listItems[findIndex],
            description: newDescription
        });
    }

    return Promise.reject("Mocking a SQL error");
}

/**
 * Mocks the deleteListItembyId method of the ListItemDAO for testing
 * @param itemId item id
 * @param shouldBeSuccessful if we should indicate success, or an error on return
 * @param shouldThrowError if we should return an error instead
 * @returns Promise containing a boolean, indicating success, or an error
 */
export function mockDeleteListItemById(itemId: number, shouldBeSuccessful: boolean, shouldThrowError = false) {
    if (!shouldThrowError) {
        return Promise.resolve(shouldBeSuccessful);
    }

    return Promise.reject("Mocking a SQL error");
}