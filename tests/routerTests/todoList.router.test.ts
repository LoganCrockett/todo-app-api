import { Request, Response, NextFunction } from "express";
import supertest from "supertest";
import TodoListDAO from "../../dao/todoList.dao";
import { todoLists } from "../../mockData/todoList.data";
import TodoList from "../../models/todoList/TodoList.model";
import User from "../../models/users/user.model";
import { addCookieToResponseSpy, getPayloadFromJWTSpy, mockAddCookieToResponse, mockGetPayloadFromJWT, mockVerifyAndRefreshJWTFromRequestCookie, verifyAndRefreshJWTFromRequestCookieSpy } from "../mocks/cookies.mock";
import { mockCreateNewList, mockDeleteListById, mockUpdateListById } from "../mocks/dao/todoList.dao.mock";
import { checkAddCookieToResponse, checkGetJWTFromPayloadWasCalled, checkGetJWTFromPayloadWasNotCalled, checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled } from "../reusableTests/cookies.test";
import { checkIfUserSessionCookieIsPresent } from "../reusableTests/userSessionCookie.test";
const server = require("../../server");

const todoListRouterLink = "/api/list";
const tester = supertest(server);

TodoListDAO.createNewList = jest.fn();
TodoListDAO.updateListById = jest.fn();
TodoListDAO.deleteListById = jest.fn();

afterEach(() => {
    jest.clearAllMocks();
});

describe("Todo List Router Tests (Valid)", () => {
    test("Creating New List (Valid)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        getPayloadFromJWTSpy.mockImplementation((req: Request) => {
            return mockGetPayloadFromJWT(req, true);
        });

        TodoListDAO.createNewList = jest.fn().mockImplementation((name: string, creadtedBy: number) => {
            return mockCreateNewList(name, creadtedBy, true);
        });

        await tester.post(`${todoListRouterLink}`)
        .set("Content-Type", "application/json")
        .send({
            name: "example name"
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            const listData: TodoList = res.body.data;

            expect(listData.id).toBeDefined();
            expect(listData.name).toMatch("example name");
            expect(listData.createdOnDate).toBeDefined();
            expect(listData.lastUpdatedDate).toBeDefined();
            expect(listData.createdBy).toBeDefined();

            checkIfUserSessionCookieIsPresent(res);
            checkAddCookieToResponse();
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();
            checkGetJWTFromPayloadWasCalled(false);
        });
    });

    test.each(todoLists)("Updating a List (Valid)", async (list) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        TodoListDAO.updateListById = jest.fn().mockImplementation((id: number, name: string) => {
            return mockUpdateListById(id, name, true);
        });

        await tester.put(`${todoListRouterLink}/${list.id}`)
        .set("Content-Type", "application/json")
        .send({
            name: "Testing Name Update"
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            const updatedList: TodoList = res.body.data;

            expect(updatedList.id).toEqual(list.id);
            expect(updatedList.name).toMatch("Testing Name Update");
            expect(updatedList.createdBy).toBeDefined();
            expect(updatedList.createdOnDate).toBeDefined();
            expect(updatedList.lastUpdatedDate).toBeDefined();

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(TodoListDAO.updateListById).toBeCalledWith(list.id, "Testing Name Update");
            expect(TodoListDAO.updateListById).toReturn();
        });
    });

    test.each(todoLists)("Deleting a List (Valid)", async (list) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        TodoListDAO.deleteListById = jest.fn().mockImplementation((id: number) => {
            return mockDeleteListById(id, true);
        });

        await tester.delete(`${todoListRouterLink}/${list.id}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(TodoListDAO.deleteListById).toBeCalledWith(list.id);
        });
    });
});

const invalidNewListData = [
    undefined,
    null,
    {
        name: undefined,
    },
    {
        name: null,
    },
    {
        name: "",
    }
];

const invalidIds = [
    undefined,
    null,
    "name"
];

describe("Todo List Router Tests (Invalid)", () => {
    test.each(invalidNewListData)("Creating New List (Invalid Data)", async (data) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req, res, next) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        await tester.post(`${todoListRouterLink}`)
        .set("Content-Type", "application/json")
        .send({
            data
        })
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect (typeof res.body.data).toMatch("string");

            checkIfUserSessionCookieIsPresent(res);
            checkAddCookieToResponse();
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();
            checkGetJWTFromPayloadWasNotCalled();
        });
    });

    test("Creating New List (User Id Error)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        getPayloadFromJWTSpy.mockImplementation((req: Request) => {
            return mockGetPayloadFromJWT(req, false);
        });

        await tester.post(`${todoListRouterLink}`)
        .set("Content-Type", "application/json")
        .send({
            name: "example name"
        })
        .expect("Content-Type", /json/)
        .expect(500)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect (typeof res.body.data).toMatch("string");

            checkIfUserSessionCookieIsPresent(res);
            checkAddCookieToResponse();
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();
            checkGetJWTFromPayloadWasCalled(true);
        });
    });

    test("Creating New List (SQL Error)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        getPayloadFromJWTSpy.mockImplementation((req: Request) => {
            return mockGetPayloadFromJWT(req, true);
        });

        TodoListDAO.createNewList = jest.fn().mockImplementation((name: string, creadtedBy: number) => {
            return mockCreateNewList(name, creadtedBy, false);
        });

        await tester.post(`${todoListRouterLink}`)
        .set("Content-Type", "application/json")
        .send({
            name: "example name"
        })
        .expect("Content-Type", /json/)
        .expect(500)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect (typeof res.body.data).toMatch("string");

            checkIfUserSessionCookieIsPresent(res);
            checkAddCookieToResponse();
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();
            checkGetJWTFromPayloadWasCalled(false);

            expect(TodoListDAO.createNewList).toBeCalledTimes(1);
            expect(TodoListDAO.createNewList).toReturn();
        });
    });

    test.each(invalidIds)("Updating a new list (Invalid Id)", async (id) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        await tester.put(`${todoListRouterLink}/${id}`)
        .set("Content-Type", "application/json")
        .send()
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(TodoListDAO.updateListById).not.toBeCalled();
        });
    });

    test.each(invalidNewListData)("Updating a List (Invalid Update Data)", async (data) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        await tester.put(`${todoListRouterLink}/1`)
        .set("Content-Type", "application/json")
        .send({
            data
        })
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(TodoListDAO.updateListById).not.toBeCalled();
        });
    });

    test("Updating a List (Id not found)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        TodoListDAO.updateListById = jest.fn().mockImplementation((id: number, name: string) => {
            return mockUpdateListById(id, name, false);
        });

        await tester.put(`${todoListRouterLink}/1`)
        .set("Content-Type", "application/json")
        .send({
            name: "Testing Name"
        })
        .expect("Content-Type", /json/)
        .expect(404)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(TodoListDAO.updateListById).toBeCalledWith(1, "Testing Name");
            expect(TodoListDAO.updateListById).toReturn();
        });
    });

    test("Updating a List (SQL Error)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        TodoListDAO.updateListById = jest.fn().mockImplementation((id: number, name: string) => {
            return Promise.reject("Mocking a SQL error");
        });

        await tester.put(`${todoListRouterLink}/1`)
        .set("Content-Type", "application/json")
        .send({
            name: "Testing Name"
        })
        .expect("Content-Type", /json/)
        .expect(500)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(TodoListDAO.updateListById).toBeCalledWith(1, "Testing Name");
        });
    });

    test.each(invalidIds)("Deleting a list (Invalid Id)", async (id) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        await tester.delete(`${todoListRouterLink}/${id}`)
        .set("Content-Type", "application/json")
        .send()
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(TodoListDAO.deleteListById).not.toBeCalled();
        });
    });

    test("Deleting a List (SQL Error)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        TodoListDAO.deleteListById = jest.fn().mockImplementation((id: number) => {
            return Promise.reject("Mocking a SQL error");
        });

        await tester.delete(`${todoListRouterLink}/1`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(500)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(TodoListDAO.deleteListById).toBeCalledWith(1);
        });
    });

    test("Deleting a List (No records found)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        TodoListDAO.deleteListById = jest.fn().mockImplementation((id: number) => {
            return mockDeleteListById(id, false);
        });

        await tester.delete(`${todoListRouterLink}/1`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(404)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(TodoListDAO.deleteListById).toBeCalledWith(1);
        });
    });
});