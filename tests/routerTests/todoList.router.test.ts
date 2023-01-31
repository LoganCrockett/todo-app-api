import { Request, Response, NextFunction } from "express";
import supertest from "supertest";
import TodoListDAO from "../../dao/todoList.dao";
import invalidIds from "../../mockData/invalidIds.data";
import { todoLists } from "../../mockData/todoList.data";
import Page from "../../models/Page";
import TodoList from "../../models/todoList/TodoList.model";
import User from "../../models/users/user.model";
import { addCookieToResponseSpy, getPayloadFromJWTSpy, mockAddCookieToResponse, mockGetPayloadFromJWT, mockVerifyAndRefreshJWTFromRequestCookie, testUserForJWT, verifyAndRefreshJWTFromRequestCookieSpy } from "../mocks/cookies.mock";
import { mockCreateNewList, mockDeleteListById, mockGetListByPage, mockUpdateListById } from "../mocks/dao/todoList.dao.mock";
import { checkAddCookieToResponse, checkGetJWTFromPayloadWasCalled, checkGetJWTFromPayloadWasNotCalled, checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled } from "../reusableTests/cookies.test";
import { checkIfUserSessionCookieIsPresent } from "../reusableTests/userSessionCookie.test";
const server = require("../../server");

const todoListRouterLink = "/api/list";
const tester = supertest(server);

TodoListDAO.createNewList = jest.fn();
TodoListDAO.updateListById = jest.fn();
TodoListDAO.deleteListById = jest.fn();
TodoListDAO.getListByPage = jest.fn();

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

    test("Getting a page of Lists (Valid)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        getPayloadFromJWTSpy.mockImplementation((req: Request) => {
            return mockGetPayloadFromJWT(req, true);
        });

        TodoListDAO.getListByPage = jest.fn().mockImplementation((userId: number, page: number, perPage: number) => {
            return mockGetListByPage(userId, page, perPage, true);
        });

        const listsForUser = todoLists.filter((list) => {
            return list.createdBy === testUserForJWT.id
        });

        await tester.get(`${todoListRouterLink}`)
        .set("Content-Type", "application/json")
        .query({
            page: 1,
            perPage: 20
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            const pagedLists: Page<TodoList> = res.body.data;

            expect(pagedLists.page).toEqual(1);
            expect(pagedLists.perPage).toEqual(20);
            expect(pagedLists.totalPages).toBeDefined();
            expect(pagedLists.data.length).toEqual(listsForUser.length);

            checkIfUserSessionCookieIsPresent(res);
            checkAddCookieToResponse();
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();
            checkGetJWTFromPayloadWasCalled(false);

            expect(TodoListDAO.getListByPage).toBeCalled();
            expect(TodoListDAO.getListByPage).toBeCalledWith(testUserForJWT.id, 1, 20);
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

const invalidPageParameters = [
    {
        page: undefined,
        perPage: 20
    },
    {
        page: null,
        perPage: 20
    },
    {
        page: "undefined",
        perPage: 20
    },
    {
        page: 0,
        perPage: 20
    },
    {
        page: 1,
        perPage: undefined
    },
    {
        page: 1,
        perPage: null
    },
    {
        page: 1,
        perPage: "undefined"
    },
    {
        page: 1,
        perPage: 0
    }
];

describe("Todo List Router Tests (Invalid)", () => {
    test.each(invalidIds)("Invalid Id Format Tests (Catch All middleware)", async (id) => {
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

    test("Getting a page of Lists (User Id Error)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        getPayloadFromJWTSpy.mockImplementation((req: Request) => {
            return mockGetPayloadFromJWT(req, false);
        });

        await tester.get(`${todoListRouterLink}`)
        .set("Content-Type", "application/json")
        .send()
        .expect("Content-Type", /json/)
        .expect(500)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect (typeof res.body.data).toMatch("string");

            checkIfUserSessionCookieIsPresent(res);
            checkAddCookieToResponse();
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();
            checkGetJWTFromPayloadWasCalled(true);

            expect(TodoListDAO.getListByPage).not.toBeCalled();
        });
    });

    test.each(invalidPageParameters)("Getting a page of Lists (Invalid Parameters)", async (parameters) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        getPayloadFromJWTSpy.mockImplementation((req: Request) => {
            return mockGetPayloadFromJWT(req, true);
        });

        await tester.get(`${todoListRouterLink}`)
        .set("Content-Type", "application/json")
        .query({
            parameters
        })
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect (typeof res.body.data).toMatch("string");

            checkIfUserSessionCookieIsPresent(res);
            checkAddCookieToResponse();
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();
            checkGetJWTFromPayloadWasCalled(false);

            expect(TodoListDAO.getListByPage).not.toBeCalled();
        });
    });

    test("Getting a Page of Lists (SQL Error)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        getPayloadFromJWTSpy.mockImplementation((req: Request) => {
            return mockGetPayloadFromJWT(req, true);
        });

        TodoListDAO.getListByPage = jest.fn().mockImplementation((userId: number, page: number, perPage: number) => {
            return mockGetListByPage(userId, page, perPage, false);
        });

        await tester.get(`${todoListRouterLink}`)
        .set("Content-Type", "application/json")
        .query({
            page: 1,
            perPage: 20
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

            expect(TodoListDAO.getListByPage).toBeCalled();
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