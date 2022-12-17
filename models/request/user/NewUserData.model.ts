export default interface NewUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

/**
 * Type to be used for testing purposes only
 * of the NewUserData model
 */
export interface NewUserTestData {
    email: string | undefined;
    password: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
};