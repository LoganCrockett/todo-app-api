export default interface UserLoginCredentials {
    email: string;
    password: string;
};

/**
 * Used for testing invalid login crednetials
 */
export interface UserLoginTestCredentials {
    email: string | undefined;
    password: string | undefined;
}