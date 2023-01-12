/**
 * The purpose of this file is to store functions that emulate the behavior of the methods
 * in UserDAO class.
 * 
 * This is the best way I could find to reuse logic for mocking, as I could not
 * find a way to reuse jest mocks
 */

import User from "../../../models/users/user.model";

/**
 * Mocks the createUser function from the UserDAO
 * @param email user email
 * @param password user password
 * @param firstName user's first name
 * @param lastName  user's last name
 * @param shouldResolve if the mock should return successfully, or throw an error
 * @returns Promise containing the fake user object; otherwise, throws a fake error
 */
export function mockCreateUser(email: string, password: string, firstName: string, lastName: string, shouldResolve: boolean): Promise<User> {
    if (shouldResolve) {
        return Promise.resolve({
            id: 1,
            email,
            firstName,
            lastName,
            createdOnDate: new Date()
        });
    }
    
    throw new Error("Mocking a SQL error");
}

/**
 * Mocks the checkUserCredentialsForLogin function from the UserDAO
 * @param email user email
 * @param password user password
 * @param shouldResolve if the mock should return successfully, or return undefined
 * @returns Promise with the fake user object; otherwise, undefined
 */
export function mockCheckUserCredentialsForLogin(email: string, password: string, shouldResolve: boolean): Promise<User | undefined> {
    if (shouldResolve) {
        return Promise.resolve({
            id: 1,
            email,
            firstName: "Test",
            lastName: "User",
            createdOnDate: new Date()
        });
    }

    // In this case, we want to resolve, since a SQL error did not occur
    return Promise.resolve(undefined);
}

/**
 * Mocks the getUserById function from the UserDAO
 * @param id user's id
 * @param shouldResolve if the mock should return successfully, or return undefind
 * @returns Promise with the fake user object; otherwise, undefined
 */
export function mockGetUserById(id: number, shouldResolve: boolean): Promise<User | undefined> {
    if (shouldResolve) {
        return Promise.resolve({
            id,
            email: "example@email.com",
            firstName: "Test",
            lastName: "User",
            createdOnDate: new Date()
        });
    }
    return Promise.resolve(undefined);
}

/**
 * Mocks the updateUserById method from the UserDAO
 * @param id user's id
 * @param firstName updated first name
 * @param lastName updated last name
 * @param shouldResolve if the mock should return successfully, or return undefind
 * @returns Promise with the fake user object; otherwise, undefined
 */
export function mockUpdateUserById(id: number, firstName: string, lastName: string, shouldResolve: boolean): Promise<User | undefined> {
    if (shouldResolve) {
        return Promise.resolve({
            id,
            email: "example@email.com",
            firstName,
            lastName,
            createdOnDate: new Date()
        });
    }
    return Promise.resolve(undefined);
}

/**
 * Mocks the resetUserPassword method from the UserDAO
 * @param id user's id
 * @param oldPassword user's old password
 * @param newPassword user's new password
 * @param shouldResolve if the mock should return successfully, or not
 * @returns Promise with a boolean, denoting if it was successful or not
 */
export function mockResetUserPassword(id: number, oldPassword: string, newPassword: string, shouldResolve: boolean): Promise<boolean> {
    return Promise.resolve(shouldResolve);
}