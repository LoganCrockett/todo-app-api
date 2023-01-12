const server = require("../../server");
import supertest from "supertest";
import NewUserData, { NewUserTestData } from "../../models/request/user/NewUserData.model";
import UserDao from "../../dao/user.dao";
import UserLoginCredentials, { UserLoginTestCredentials } from "../../models/request/user/UserLoginCredentials.model";
import { NextFunction, Response, Request } from "express";
import { users } from "../../mockData/users.data";
import ResponseBody from "../../models/response/responseBody.model";
import { checkIfUserSessionCookieIsPresent, checkIfUserSessionCookieIsNotPresent } from "../reusableTests/userSessionCookie.test";
import { mockCheckUserCredentialsForLogin, mockCreateUser, mockGetUserById, mockUpdateUserById } from "../mocks/dao/user.dao.mock";
import UpdateUserData from "../../models/request/user/UpdateUserData.model";
import { addCookieToResponseSpy, mockAddCookieToResponse, mockVerifyAndRefreshJWTFromRequestCookie, mockVerifyJWTTokenFromRequestCookie, verifyAndRefreshJWTFromRequestCookieSpy, verifyJWTTokenFromRequestCookieSpy } from "../mocks/cookies.mock";
import { checkAddCookieToResponse, checkAddCookieToResponseWasNotCalled, checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled, checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasNotCalled, checkVerifyJWTTokenFromRequestCookieSpyWasCalled, checkVerifyJWTTokenFromRequestCookieSpyWasNotCalled } from "../reusableTests/cookies.test";

const tester = supertest(server);
const userRouterLink: string = "/api/user";

beforeEach(() => {
    UserDao.createUser = jest.fn();
    UserDao.checkUserCredentialsForLogin = jest.fn();
    UserDao.getUserById = jest.fn();
    UserDao.updateUserById = jest.fn();
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

            checkAddCookieToResponseWasNotCalled();

            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasNotCalled();

            checkVerifyJWTTokenFromRequestCookieSpyWasNotCalled();

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

        verifyJWTTokenFromRequestCookieSpy.mockImplementation((req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
            mockVerifyJWTTokenFromRequestCookie(req, res, next, true);
        });

        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            mockAddCookieToResponse(res, {});
        });

        await tester.post(`${userRouterLink}/login`)
        .set("Content-Type", "application/json")
        .send(userCredentialsData)
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();

            checkIfUserSessionCookieIsPresent(res);

            checkVerifyJWTTokenFromRequestCookieSpyWasCalled();

            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenCalledTimes(1);
            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenLastCalledWith(userCredentialsData.email, userCredentialsData.password);
        });
    });

    test.each(users)("Getting User by Id", async (user) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            mockAddCookieToResponse(res, {});
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
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

            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            checkAddCookieToResponse();

            checkIfUserSessionCookieIsPresent(res);

            expect(UserDao.getUserById).toHaveBeenCalledTimes(1);
            expect(UserDao.getUserById).toHaveBeenCalledWith(user.id);
        });
    });

    test("Updating User by Id", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            mockAddCookieToResponse(res, {});
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        const updateUserData: UpdateUserData = {
            firstName: "Test",
            lastName: "User"
        };

        UserDao.updateUserById = jest.fn().mockImplementation(() => {
            return mockUpdateUserById(1, updateUserData.firstName, updateUserData.lastName, true);
        });

        await tester.put(`${userRouterLink}/${1}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .send({
            firstName: updateUserData.firstName,
            lastName: updateUserData.lastName
        })
        .expect(200)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("object");

            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            checkAddCookieToResponse();

            checkIfUserSessionCookieIsPresent(res);

            expect(UserDao.updateUserById).toHaveBeenCalledTimes(1);
            expect(UserDao.updateUserById).toHaveBeenCalledWith(1, updateUserData.firstName, updateUserData.lastName);
        });
    });

    test.todo("Reseting User Password");
    
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

const invalidUpdateUserData = [
    {
        id: 1,
        firstName: undefined,
        lastName: "User"
    },
    {
        id: 2,
        firstName: null,
        lastName: "User"
    },
    {
        id: 3,
        firstName: "undefined",
        lastName: "User"
    },
    {
        id: 4,
        firstName: "null",
        lastName: "User"
    },
    {
        id: 5,
        firstName: "",
        lastName: "User"
    },
    {
        id: 6,
        firstName: "Test",
        lastName: undefined
    },
    {
        id: 7,
        firstName: "Test",
        lastName: null
    },
    {
        id: 8,
        firstName: "Test",
        lastName: "undefined"
    },
    {
        id: 9,
        firstName: "Test",
        lastName: "null"
    },
    {
        id: 10,
        firstName: "Test",
        lastName: ""
    },
]

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

            checkAddCookieToResponseWasNotCalled();

            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasNotCalled();

            checkVerifyJWTTokenFromRequestCookieSpyWasNotCalled();

            expect(UserDao.createUser).not.toBeCalled();
        })
    });

    test.each(invalidLoginCredentials)("User Log In (Invalid email & password)", async (inputData) => {
        verifyJWTTokenFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyJWTTokenFromRequestCookie(req, res, next, true);
        });

        await tester.post(`${userRouterLink}/login`)
        .set("Content-Type", "application/json")
        .send(inputData)
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkIfUserSessionCookieIsNotPresent(res);

            checkAddCookieToResponseWasNotCalled();

            checkVerifyJWTTokenFromRequestCookieSpyWasCalled();

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

        verifyJWTTokenFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyJWTTokenFromRequestCookie(req, res, next, true);
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

            checkAddCookieToResponseWasNotCalled();

            checkVerifyJWTTokenFromRequestCookieSpyWasCalled();

            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenCalledTimes(1);
            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenCalledWith(userLoginData.email, userLoginData.password);
        });
    });

    test("User Log In (User Already Logged In)", async () => {
        const userCredentialsData: UserLoginCredentials = {
            email: "example@email.com",
            password: "P@ssword123"
        };

        verifyJWTTokenFromRequestCookieSpy.mockImplementation((req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
            mockVerifyJWTTokenFromRequestCookie(req, res, next, false);
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

            checkVerifyJWTTokenFromRequestCookieSpyWasCalled();

            checkAddCookieToResponseWasNotCalled();

            expect(UserDao.checkUserCredentialsForLogin).toHaveBeenCalledTimes(0);
        });
    });

    test.each(invalidUserIds)("Getting User by Id (Invalid)", async (id) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            mockAddCookieToResponse(res, {});
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        await tester.get(`${userRouterLink}/${id}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            checkAddCookieToResponse();

            checkIfUserSessionCookieIsPresent(res);

            expect(UserDao.getUserById).not.toBeCalled();
        });
    });

    test("Getting User by Id (Does not exist)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            mockAddCookieToResponse(res, {});
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
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

            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            checkAddCookieToResponse();

            checkIfUserSessionCookieIsPresent(res);

            expect(UserDao.getUserById).toHaveBeenCalledTimes(1);
            expect(UserDao.getUserById).toHaveBeenCalledWith(1);
        });
    });

    test.each(invalidUserIds)("Updating user by Id (Invalid Id's)", async (id) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            mockAddCookieToResponse(res, {});
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        await tester.put(`${userRouterLink}/${id}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            checkAddCookieToResponse();

            checkIfUserSessionCookieIsPresent(res);

            expect(UserDao.updateUserById).not.toHaveBeenCalled();
        });
    });

    test.each(invalidUpdateUserData)("Updating user by Id (Invalid Update Data)", async ({ id, firstName, lastName }) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            mockAddCookieToResponse(res, {});
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        await tester.put(`${userRouterLink}/${id}`)
        .set("Content-Type", "application/json")
        .send({
            firstName,
            lastName
        })
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            checkAddCookieToResponse();

            checkIfUserSessionCookieIsPresent(res);

            expect(UserDao.updateUserById).not.toHaveBeenCalled();
        });
    });

    test("Updating User by Id (Does not exist)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: {}) => {
            mockAddCookieToResponse(res, {});
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        const updateUserData: UpdateUserData = {
            firstName: "Test",
            lastName: "User"
        };

        UserDao.updateUserById = jest.fn().mockImplementation(() => {
            return mockUpdateUserById(1, updateUserData.firstName, updateUserData.lastName, false);
        });

        await tester.put(`${userRouterLink}/${1}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .send({
            firstName: updateUserData.firstName,
            lastName: updateUserData.lastName
        })
        .expect(404)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            checkAddCookieToResponse();

            checkIfUserSessionCookieIsPresent(res);

            expect(UserDao.updateUserById).toHaveBeenCalledTimes(1);
            expect(UserDao.updateUserById).toHaveBeenCalledWith(1, updateUserData.firstName, updateUserData.lastName);
        });
    });

    test.todo("Reseting User Password (Invalid Data)");
});
