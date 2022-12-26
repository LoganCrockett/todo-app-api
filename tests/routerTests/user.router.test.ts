const server = require("../../server");
import supertest from "supertest";
import NewUserData, { NewUserTestData } from "../../models/request/user/NewUserData.model";
import UserDao from "../../dao/user.dao";
import User from "../../models/users/user.model";
import UserLoginCredentials, { UserLoginTestCredentials } from "../../models/request/user/UserLoginCredentials.model";
import * as userAuthFunctions from "../../helperFunctions/cookies.helper";
import { NextFunction, Response } from "express";
import { users } from "../../mockData/users.data";
import ResponseBody from "../../models/response/responseBody.model";
import { checkIfUserSessionCookieIsPresent, checkIfUserSessionCookieIsNotPresent } from "../reusableTests/userSessionCookie.test";
import { mockCheckUserCredentialsForLogin, mockCreateUser, mockGetUserById } from "../mocks/dao/user.dao.mock";

const tester = supertest(server);
const userRouterLink: string = "/api/user";

let addCookieToResponseSpy: jest.SpyInstance;
let verifyAndRefreshJWTFromRequestCookie: jest.SpyInstance;
let verifyJWTTokenFromRequestCookie: jest.SpyInstance;

beforeEach(() => {
    UserDao.createUser = jest.fn();
    UserDao.checkUserCredentialsForLogin = jest.fn();
    UserDao.getUserById = jest.fn();

    addCookieToResponseSpy = jest.spyOn(userAuthFunctions, "addCookieToResponse");
    verifyAndRefreshJWTFromRequestCookie = jest.spyOn(userAuthFunctions, "verifyAndRefreshJWTFromRequestCookie");
    verifyJWTTokenFromRequestCookie = jest.spyOn(userAuthFunctions, "verifyJWTTokenFromRequestCookie");
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

        UserDao.createUser = jest.fn().mockImplementation(() => {
            return mockCreateUser(newUserData.email,
                newUserData.password,
                newUserData.firstName,
                newUserData.lastName,
                true);
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

        UserDao.checkUserCredentialsForLogin = jest.fn().mockImplementation(() => {
            return mockCheckUserCredentialsForLogin(userCredentialsData.email, userCredentialsData.password, true);
        });

        verifyJWTTokenFromRequestCookie.mockImplementation((req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
            next();
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

            expect(addCookieToResponseSpy).toHaveBeenCalledTimes(1);
            expect(addCookieToResponseSpy).toReturn();

            checkIfUserSessionCookieIsPresent(res);

            expect(verifyJWTTokenFromRequestCookie).toHaveBeenCalledTimes(1);
            expect(verifyJWTTokenFromRequestCookie).toReturn();

            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenCalledTimes(1);
            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenLastCalledWith(userCredentialsData.email, userCredentialsData.password);
        });
    });

    test.each(users)("Getting User by Id", async (user) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            res.cookie("userSession", "example value", userAuthFunctions.cookieOptions);
        });

        verifyAndRefreshJWTFromRequestCookie.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            userAuthFunctions.addCookieToResponse(res, {});
            next();
        });

        UserDao.getUserById = jest.fn().mockImplementation(() => {
            return mockGetUserById(user.id, true);
        });

        await tester.get(`${userRouterLink}/${user.id}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("object");

            expect(verifyAndRefreshJWTFromRequestCookie).toHaveBeenCalledTimes(1);
            expect(verifyAndRefreshJWTFromRequestCookie).toReturn();

            expect(addCookieToResponseSpy).toHaveBeenCalledTimes(1);
            expect(addCookieToResponseSpy).toReturn();

            checkIfUserSessionCookieIsPresent(res);

            expect(UserDao.getUserById).toHaveBeenCalledTimes(1);
            expect(UserDao.getUserById).toHaveBeenCalledWith(user.id);
        });
    });

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

const invalidUserIds = [
    undefined,
    null,
    "testing"
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

            checkIfUserSessionCookieIsNotPresent(res);

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

        UserDao.checkUserCredentialsForLogin = jest.fn().mockImplementation(() => {
            return mockCheckUserCredentialsForLogin(userLoginData.email, userLoginData.password, false);
        });

        await tester.post(`${userRouterLink}/login`)
        .set("Content-Type", "application/json")
        .send(userLoginData)
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkIfUserSessionCookieIsNotPresent(res);

            expect(addCookieToResponseSpy).toBeCalledTimes(0);
            expect(addCookieToResponseSpy).not.toReturn();

            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenCalledTimes(1);
            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenCalledWith(userLoginData.email, userLoginData.password);
        });
    });

    test("User Log In (User Already Logged In)", async () => {
        const userCredentialsData: UserLoginCredentials = {
            email: "example@email.com",
            password: "P@ssword123"
        };

        verifyJWTTokenFromRequestCookie.mockImplementation((req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
            res.status(400).json({
                data: "user already logged in"
            });
            return;
        });

        await tester.post(`${userRouterLink}/login`)
        .set("Content-Type", "application/json")
        .send(userCredentialsData)
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkIfUserSessionCookieIsNotPresent(res);

            expect(verifyJWTTokenFromRequestCookie).toHaveBeenCalledTimes(1);
            expect(verifyJWTTokenFromRequestCookie).toReturn();

            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenCalledTimes(0);
        });
    });

    test.each(invalidUserIds)("Getting User by Id (Invalid)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            res.cookie("userSession", "example value", userAuthFunctions.cookieOptions);
        });

        verifyAndRefreshJWTFromRequestCookie.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            userAuthFunctions.addCookieToResponse(res, {});
            next();
        });

        await tester.get(`${userRouterLink}/${undefined}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            expect(verifyAndRefreshJWTFromRequestCookie).toHaveBeenCalledTimes(1);
            expect(verifyAndRefreshJWTFromRequestCookie).toReturn();

            expect(addCookieToResponseSpy).toHaveBeenCalledTimes(1);
            expect(addCookieToResponseSpy).toReturn();

            checkIfUserSessionCookieIsPresent(res);

            expect(UserDao.getUserById).not.toBeCalled();
        });
    });

    test("Getting User by Id (Does not exist)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            res.cookie("userSession", "example value", userAuthFunctions.cookieOptions);
        });

        verifyAndRefreshJWTFromRequestCookie.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            userAuthFunctions.addCookieToResponse(res, {});
            next();
        });

        UserDao.getUserById = jest.fn().mockImplementation(() => {
            return mockGetUserById(1, false);
        });

        await tester.get(`${userRouterLink}/${1}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(404)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            expect(verifyAndRefreshJWTFromRequestCookie).toHaveBeenCalledTimes(1);
            expect(verifyAndRefreshJWTFromRequestCookie).toReturn();

            expect(addCookieToResponseSpy).toHaveBeenCalledTimes(1);
            expect(addCookieToResponseSpy).toReturn();

            checkIfUserSessionCookieIsPresent(res);

            expect(UserDao.getUserById).toHaveBeenCalledTimes(1);
            expect(UserDao.getUserById).toHaveBeenCalledWith(1);
        });
    });

    test.todo("Updating user by Id");

});
