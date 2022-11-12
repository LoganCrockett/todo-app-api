/**
 * User model in the DB
 */
export default interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    createdOnDate: Date;
};

export interface UserCredentials {
    userId: number;
    password: string;
    lastLoginDate?: Date;
};

// Used for Testing purposes only
export interface UserPasswordDataTest {
    email: string,
    password: string,
    expected?: User;
}

// Used for Testing purposes only
export interface UserIdsTest {
    id: number;
    expected?: User
};

// Used for Testing purposes only
export interface UserUpdatesTest {
    id: number;
    firstName: string;
    lastName: string;
    expected?: User;
}