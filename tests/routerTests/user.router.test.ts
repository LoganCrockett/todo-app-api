const server = require("../../server");
import supertest from "supertest";
import NewUserData, { NewUserTestData } from "../../models/request/user/NewUserData.model";
import UserDao from "../../dao/user.dao";
import User from "../../models/users/user.model";
import UserLoginCredentials, { UserLoginTestCredentials } from "../../models/request/user/UserLoginCredentials.model";
import * as userAuthFunctions from "../../helperFunctions/cookies.helper";
import { Response } from "express";

const tester = supertest(server);
const userRouterLink: string = "/api/user";

let addCookieToResponseSpy: jest.SpyInstance;

beforeEach(() => {
    UserDao.createUser = jest.fn();
    UserDao.checkUserCredentialsForLogin = jest.fn();

    addCookieToResponseSpy = jest.spyOn(userAuthFunctions, "addCookieToResponse");
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("User Router (Valid Data)", () => {
    test("Creating New User", async () => {
        const newUserData: NewUserData = {
            email: "example@email.com",
            password: "P@ssword1234",
            firstName: "Test",
            lastName: "User"
        };

        UserDao.createUser = jest.fn().mockImplementation((): Promise<User> => {
            return Promise.resolve({
                    ...newUserData,
                    id: 1,
                    createdOnDate: new Date()
                });
        });

        await tester.post(userRouterLink)
        .set("Content-Type", "application/json")
        .send(newUserData)
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            expect(UserDao.createUser).toHaveBeenCalledTimes(1);
            expect(UserDao.createUser).toHaveBeenCalledWith(newUserData.email, newUserData.password, newUserData.firstName, newUserData.lastName);
        });
    });

    test("User Log In", async () => {
        const userCredentialsData: UserLoginCredentials = {
            email: "example@email.com",
            password: "P@ssword123"
        };

        UserDao.checkUserCredentialsForLogin = jest.fn().mockImplementation((): Promise<User> => {
            return Promise.resolve({
                    email: userCredentialsData.email,
                    firstName: "Test",
                    lastName: "User",
                    createdOnDate: new Date(),
                    id: 1
                });
        });

        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            res.cookie("userSession", "example value", userAuthFunctions.cookieOptions);
        });

        await tester.post(`${userRouterLink}/login`)
        .set("Content-Type", "application/json")
        .send(userCredentialsData)
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            // Make sure user was authenticated
            expect(res.headers["set-cookie"]).toBeDefined();
            expect(res.headers["set-cookie"]).toHaveLength(1);

            const setCookieHeaderValue: string = res.headers["set-cookie"][0];
            
            expect(setCookieHeaderValue).toContain("userSession");

            expect(addCookieToResponseSpy).toHaveBeenCalledTimes(1);
            expect(addCookieToResponseSpy).toReturn();

            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenCalledTimes(1);
            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenLastCalledWith(userCredentialsData.email, userCredentialsData.password);
        });
    });

    test.todo("Getting User by Id");

    test.todo("Updating user by Id");
    
});

const invalidNewUserData: Array<NewUserTestData | undefined> = [
    undefined,
    {
        email: undefined,
        password: "password",
        firstName: "First Name",
        lastName: "Last Name"
    },
    {
        email: "string",
        password: "password",
        firstName: "First Name",
        lastName: "Last Name"
    },
    {
        email: "example@email.com",
        password: undefined,
        firstName: "First Name",
        lastName: "Last Name"
    },
    {
        email: "example@email.com",
        password: "",
        firstName: "First Name",
        lastName: "Last Name"
    },
    {
        email: "example@email.com",
        password: "password",
        firstName: undefined,
        lastName: "Last Name"
    },
    {
        email: "example@email.com",
        password: "P@ssword123",
        firstName: "",
        lastName: "Last Name"
    },
    {
        email: "example@email.com",
        password: "P@ssword123",
        firstName: "First Name",
        lastName: undefined
    },
    {
        email: "example@email.com",
        password: "P@ssword123",
        firstName: "First Name",
        lastName: ""
    }
];

const invalidLoginCredentials: Array<UserLoginTestCredentials | undefined> = [
    undefined,
    {
        email: undefined,
        password: undefined
    },
    {
        email: "undefined",
        password: undefined
    },
    {
        email: undefined,
        password: "undefined"
    },
    {
        email: "example@email.com",
        password: undefined
    },
    {
        email: undefined,
        password: "P@ssword123"
    }
];

describe("User Router (Invalid Data)", () => {
    test.each(invalidNewUserData)("Creating New User (Invalid)", async (inputData) => {
        await tester.post(userRouterLink)
        .set("Content-Type", "application/json")
        .send(inputData)
        .expect("Content-Type", /json/)
        .expect(400)
        .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            expect(UserDao.createUser).not.toBeCalled();
        })
    });

    test.each(invalidLoginCredentials)("User Log In (Invalid email & password)", async (inputData) => {
        await tester.post(`${userRouterLink}/login`)
        .set("Content-Type", "application/json")
        .send(inputData)
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            // Make sure we are not authenticating the user
            expect(res.headers["set-cookie"]).toBeUndefined();

            expect(addCookieToResponseSpy).toHaveBeenCalledTimes(0);
            expect(addCookieToResponseSpy).not.toReturn();

            expect(UserDao.checkUserCredentialsForLogin).not.toBeCalled();
        });
    });

    test("User Log In (User account doesn't exist)", async () => {
        const userLoginData: UserLoginCredentials = {
            email: "example@email.com",
            password: "P@ssword123"
        };

        UserDao.checkUserCredentialsForLogin = jest.fn().mockImplementation((): Promise<undefined> => {
            return Promise.resolve(undefined);
        });

        await tester.post(`${userRouterLink}/login`)
        .set("Content-Type", "application/json")
        .send(userLoginData)
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            // Make sure we are not authenticating the user
            expect(res.headers["set-cookie"]).toBeUndefined();

            expect(addCookieToResponseSpy).toBeCalledTimes(0);
            expect(addCookieToResponseSpy).not.toReturn();

            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenCalledTimes(1);
            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenCalledWith(userLoginData.email, userLoginData.password);
        });
    });

    test.todo("Getting User by Id");

    test.todo("Updating user by Id");

});
