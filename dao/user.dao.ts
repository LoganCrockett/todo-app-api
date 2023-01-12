import argon2 from "argon2";
import sql from "../db";
import argon2Options from "../helperFunctions/argon2Options.helper";
import User from "../models/users/user.model";

export default class UserDAO {

    /**
     * Creates a new user account
     * @param email user's email (username)
     * @param password user's password
     * @param firstName user's first name
     * @param lastName user's last name
     * @returns Promise containing the new user object, or the error if an error is received
     */
    public static async createUser(email: string, password: string, firstName: string, lastName: string): Promise<User> {
        return await sql.begin(async (sql) => {
            const [user] = await sql<User[]>`
            insert into todo.users (email, "firstName", "lastName", "createdOnDate")
            values (
                ${email}, ${firstName}, ${lastName}, now()
            )
            returning id, email, "firstName", "lastName", "createdOnDate"
            `;

            await argon2.hash(password, {
                ...argon2Options,
                raw: false
            })
            .then(async (result) => {
                await sql`insert into todo."userCredentials" ("userId", password, "lastLoginDate")
                values (
                    ${ user.id }, ${result}, now()
                )`;
            });

            return user;
        });
    };

    /**
     * Checks if the passed credentials match a user account. If it matches, it updates the lastLoginDate as well
     * @param email user's email
     * @param password user's password
     * @returns the user's information if the account exists
     */
    public static async checkUserCredentialsForLogin(email: string, password: string): Promise<User | undefined> {
        return await sql.begin(async (sql) => {
            const passwordHash = await sql`select uc.password from todo."userCredentials" uc join todo.users u on u.id = uc."userId"
            where u.email = ${email}`;

            if (passwordHash === undefined || passwordHash.length !== 1) {
                return undefined;
            }

            return await argon2.verify(passwordHash[0].password, password, argon2Options)
            .then(async (result) => {
                if (result) {
                    const [user] = await sql<User[]>`update only todo."userCredentials" uc set "lastLoginDate" = now()
                    from todo.users u where uc."userId" = u.id and u.email = ${ email } and uc.password = ${ passwordHash[0].password }
                    returning u.*`;

                    return user;
                }

                return undefined;
            })
        });
    }

    /**
     * Fetches the user's data by id
     * @param id user id
     * @returns user's information if found; otherwise, undefined
     */
    public static async getUserById(id: number): Promise<User> {
        return await sql.begin(async (sql) => {
            const [user] = await sql<User[]>`select * from todo.users u where u.id = ${ id }`;

            return user;
        });
    }

    /**
     * Updates the user's information based on their id
     * @param id user's id
     * @param firstName updated first name
     * @param lastName updated last name
     * @returns updated user object if id exists; otherwise, undefined
     */
    public static async updateUserById(id: number, firstName: string, lastName: string): Promise<User> {
        return await sql.begin(async (sql) => {
            const [user] = await sql<User[]>`update todo.users u set "firstName" = ${ firstName }, "lastName" = ${ lastName }
            where u.id = ${ id }
            returning u.*`;

            return user;
        });
    }

    /**
     * Resets a user's password based on their id & old password
     * @param email user's email
     * @param oldPassword user's current password
     * @param newPassword new password
     * @returns true if updated successfully; otherwise, false
     */
    public static async resetUserPassword(id: number, oldPassword: string, newPassword: string): Promise<boolean> {
        return await sql.begin(async (sql) => {
            const currentPasswordHash = await sql`select uc.password from todo."userCredentials" uc where uc."userId" = ${id}`;

            if (currentPasswordHash === undefined || currentPasswordHash.length !== 1) {
                return false;
            }

            return await argon2.verify(currentPasswordHash[0].password, oldPassword)
            .then(async (result) => {
                if (result) {
                    return await argon2.hash(newPassword, {
                        ...argon2Options,
                        raw: false
                    })
                    .then(async (newPasswordHash) => {
                        const res = await sql`update todo."userCredentials" uc
                        set password = ${newPasswordHash}
                        where uc."userId" = ${id} and uc.password = ${currentPasswordHash[0].password}`;

                        return res.count === 1;
                    })
                }

                return false;
            });
        });
    }
}