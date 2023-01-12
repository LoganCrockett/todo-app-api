import { PostgresError } from "postgres";
import UserDAO from "../../dao/user.dao";
import { emailAndPasswordData, userIds, userPasswordResetData, userUpdates } from "../../mockData/users.data";
import User from "../../models/users/user.model";
import { insertUsersAndCredentials, removeUsersAndCredentials } from "../mocks/db.setup";

beforeEach(async () => {
    await insertUsersAndCredentials();
});

afterEach(async () => {
    await removeUsersAndCredentials();
});

describe("User DAO Tests", () => {
    test("Creating New User", async () => {
        const userData = {
            email: "example@email.com",
            password: "password",
            firstName: "Logan",
            lastName: "Crockett"
        };

        await UserDAO.createUser(userData.email, userData.password, userData.firstName, userData.lastName)
        .then((user: User) => {
            expect(user).toBeDefined();
            expect(user).toHaveProperty("id");
            expect(user).toHaveProperty("email");
            expect(user).toHaveProperty("firstName");
            expect(user).toHaveProperty("lastName");
            expect(user).toHaveProperty("createdOnDate");

            expect(user.id).not.toBeNull();
            expect(user.createdOnDate).not.toBeNull();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        });
    });

    test.each(userIds)("Get User By Id", async ({id, expected}) => {
        await UserDAO.getUserById(id)
        .then((user: User) => {
            if (expected === undefined) {
                expect(user).toBeUndefined();
            }
            else {
                expect(user).toBeDefined();
                expect(user.id).toEqual(expected.id);
                expect(user.email).toMatch(expected.email);
                expect(user.firstName).toMatch(expected.firstName);
                expect(user.lastName).toMatch(expected.lastName);
            }
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        });
    });

    test.each(emailAndPasswordData)("User Log In (Checking credentials)", async ({ email, password, expected }) => {
        await UserDAO.checkUserCredentialsForLogin(email, password)
        .then((user: User | undefined) => {
            if (expected === undefined) {
                expect(user).toBeUndefined();
            }
            else {
                expect(user).toBeDefined();
                // @ts-ignore
                expect(user.email).toMatch(expected.email);
                // @ts-ignore
                expect(user.id).toEqual(expected.id);
                // @ts-ignore
                expect(user.firstName).toMatch(expected.firstName);
                // @ts-ignore
                expect(user.lastName).toMatch(expected.lastName);
                // @ts-ignore
                expect(user.createdOnDate).toEqual(expected.createdOnDate)
            }
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toBe("Received an error. Forcing this test to fail.");
        })
    });

    test.each(userUpdates)("User Update", async (userToTest) => {
        const firstName = `${userToTest.firstName}-testUpdate`;
        const lastName = `${userToTest.lastName}-testUpdate`;
        await UserDAO.updateUserById(userToTest.id, firstName, lastName)
        .then((user: User) => {
            if (userToTest.expected === undefined) {
                expect(user).toBeUndefined();
            }
            else {
                expect(user).toBeDefined();
                expect(user.id).toEqual(userToTest.expected.id);
                expect(user.email).toMatch(userToTest.expected.email);
                expect(user.firstName).toMatch(firstName);
                expect(user.lastName).toMatch(lastName);
            }
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toMatch("Received an error. Forcing this test to fail.");
        });
    });

    test.each(userPasswordResetData)("Password Reset", async (data) => {
        await UserDAO.resetUserPassword(data.email, data.password, data.newPassword)
        .then((res: boolean) => {
            expect(res).toBeDefined();
            data.expected ? expect(res).toBeTruthy() : expect(res).toBeFalsy();
        })
        .catch((err: PostgresError) => {
            console.log(err.message);
            expect(err.message).toMatch("Received an error. Forcing this test to fail.");
        });
    });
});