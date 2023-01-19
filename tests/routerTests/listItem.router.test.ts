import { Request, Response, NextFunction } from "express";
import User from "../../models/users/user.model";
import { addCookieToResponseSpy, mockAddCookieToResponse, verifyAndRefreshJWTFromRequestCookieSpy, mockVerifyAndRefreshJWTFromRequestCookie } from "../mocks/cookies.mock";
import supertest from "supertest";
import { checkAddCookieToResponse, checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled } from "../reusableTests/cookies.test";
import { checkIfUserSessionCookieIsPresent } from "../reusableTests/userSessionCookie.test";
import ListItemDAO from "../../dao/listItem.dao";
import { mockCreateNewListItem, mockDeleteListItemById, mockGetListItemsByListId, mockUpdateListItemById } from "../mocks/dao/listItem.dao.mock";
import { todoLists } from "../../mockData/todoList.data";
import ListItem from "../../models/listItems/ListItem.model";
import { listItems } from "../../mockData/listItems.data";
import invalidIds from "../../mockData/invalidIds.data";
const server = require("../../server");

const tester = supertest(server);
const todoListRouterLink = "/api/list";
const listItemRouterLink = "/item";

ListItemDAO.createListItem = jest.fn();
ListItemDAO.getListItemsByListId = jest.fn();
ListItemDAO.updateListItemById = jest.fn();
ListItemDAO.deleteListItemById = jest.fn();

afterEach(() => {
    jest.clearAllMocks();
});

describe("List Item Router (Valid)", () => {
    test.each(todoLists)("Create a New Item (Valid)", async (list) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        ListItemDAO.createListItem = jest.fn().mockImplementation((listId: number, description: string) => {
            return mockCreateNewListItem(listId, description, true);
        });

        await tester.post(`${todoListRouterLink}/${list.id}${listItemRouterLink}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .send({
            description: "creating new item"
        })
        .expect(200)
        .then((res) => {
            expect(res).toBeDefined();
            const listItem: ListItem = res.body.data;

            expect(listItem.id).toBeDefined();
            expect(listItem.listId).toEqual(list.id);
            expect(listItem.description).toMatch("creating new item");
            expect(listItem.createdOnDate).toBeDefined();

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.createListItem).toBeCalledTimes(1);
            expect(ListItemDAO.createListItem).toBeCalledWith(list.id, "creating new item");
            expect(ListItemDAO.createListItem).toReturn();
        });
    });

    test.each(todoLists)("Getting List Items by List Id (Valid)", async (list) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        ListItemDAO.getListItemsByListId = jest.fn().mockImplementation((listId: number) => {
            return mockGetListItemsByListId(listId, true);
        });

        const listItemsForList = listItems.filter((item) => {
            return item.listId === list.id;
        });

        await tester.get(`${todoListRouterLink}/${list.id}${listItemRouterLink}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.data.length).toEqual(listItemsForList.length);

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.getListItemsByListId).toBeCalledTimes(1);
            expect(ListItemDAO.getListItemsByListId).toBeCalledWith(list.id);
        });
    });

    test("Getting List Items by List Id (No Items Present)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        ListItemDAO.getListItemsByListId = jest.fn().mockImplementation((listId: number) => {
            return mockGetListItemsByListId(listId, true);
        });

        await tester.get(`${todoListRouterLink}/${-1}${listItemRouterLink}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.data.length).toEqual(0);

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.getListItemsByListId).toBeCalledTimes(1);
            expect(ListItemDAO.getListItemsByListId).toBeCalledWith(-1);
        });
    });

    test.each(listItems)("Updating an Item (Valid)", async (item) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        ListItemDAO.updateListItemById = jest.fn().mockImplementation((itemId: number, newDescription: string) => {
            return mockUpdateListItemById(itemId, newDescription, true);
        });

        await tester.put(`${todoListRouterLink}/${item.listId}${listItemRouterLink}/${item.id}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .send({
            description: "data"
        })
        .expect(200)
        .then((res) => {
            expect(res.body.data).toBeDefined();
            
            const updatedItem: ListItem = res.body.data;

            expect(updatedItem.id).toEqual(item.id);
            expect(updatedItem.description).toMatch("data");
            expect(updatedItem.listId).toEqual(item.listId);
            expect(updatedItem.createdOnDate).toBeDefined();

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.updateListItemById).toBeCalledTimes(1);
            expect(ListItemDAO.updateListItemById).toBeCalledWith(item.id, "data");
        });
    });

    test.each(listItems)("Deleting an Item By Id (Valid)", async (item) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        ListItemDAO.deleteListItemById = jest.fn().mockImplementation((itemId: number) => {
            return mockDeleteListItemById(itemId, true);
        })

        await tester.delete(`${todoListRouterLink}/${item.listId}${listItemRouterLink}/${item.id}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.deleteListItemById).toBeCalledTimes(1);
            expect(ListItemDAO.deleteListItemById).toBeCalledWith(item.id);
        });
    });
});

const invalidNewListItemData = [
    undefined,
    null,
    "",
    "undefined",
    "null"
];

describe("List Item Router (Invalid)", () => {
    test.each(invalidIds)("Checking Invalid Item Id's", async (id) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        await tester.put(`${todoListRouterLink}/1${listItemRouterLink}/${id}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(400)
        .then((res) => {
            expect(res).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();
        });
    });

    test.each(invalidNewListItemData)("Create a New Item (Invalid Data)", async (data) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        await tester.post(`${todoListRouterLink}/-1${listItemRouterLink}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .send({
            description: data
        })
        .expect(400)
        .then((res) => {
            expect(res).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.createListItem).not.toBeCalled();
        });
    });

    test("Create a New Item (SQL Error)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        ListItemDAO.createListItem = jest.fn().mockImplementation((listId: number, description: string) => {
            return mockCreateNewListItem(listId, description, false);
        });

        await tester.post(`${todoListRouterLink}/1${listItemRouterLink}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .send({
            description: "testing sql error"
        })
        .expect(500)
        .then((res) => {
            expect(res).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.createListItem).toBeCalledTimes(1);
            expect(ListItemDAO.createListItem).toBeCalledWith(1, "testing sql error");
        });
    });

    test.each(todoLists)("Getting List Items by List Id (SQL Error)", async (list) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        ListItemDAO.getListItemsByListId = jest.fn().mockImplementation((listId: number) => {
            return mockGetListItemsByListId(listId, false);
        });

        await tester.get(`${todoListRouterLink}/${list.id}${listItemRouterLink}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(500)
        .then((res) => {
            expect(res).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.getListItemsByListId).toBeCalledTimes(1);
            expect(ListItemDAO.getListItemsByListId).toBeCalledWith(list.id);
        });
    });

    test.each(invalidNewListItemData)("Updating an Item (Invalid Data)", async (data) => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        await tester.put(`${todoListRouterLink}/-1${listItemRouterLink}/-1`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .send({
            description: data
        })
        .expect(400)
        .then((res) => {
            expect(res).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.updateListItemById).not.toBeCalled();
        });
    });

    test("Updating an Item (SQL Error)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        ListItemDAO.updateListItemById = jest.fn().mockImplementation((itemId: number, newDescription: string) => {
            return mockUpdateListItemById(itemId, newDescription, false);
        });

        await tester.put(`${todoListRouterLink}/-1${listItemRouterLink}/-1`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .send({
            description: "data"
        })
        .expect(500)
        .then((res) => {
            expect(res).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.updateListItemById).toBeCalledTimes(1);
            expect(ListItemDAO.updateListItemById).toBeCalledWith(-1, "data");
        });
    });

    test("Updating an Item (Item doesn't exist)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        ListItemDAO.updateListItemById = jest.fn().mockImplementation((itemId: number, newDescription: string) => {
            return mockUpdateListItemById(itemId, newDescription, true);
        });

        await tester.put(`${todoListRouterLink}/-1${listItemRouterLink}/-1`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .send({
            description: "data"
        })
        .expect(404)
        .then((res) => {
            expect(res).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.updateListItemById).toBeCalledTimes(1);
            expect(ListItemDAO.updateListItemById).toBeCalledWith(-1, "data");
        });
    });

    test("Deleting an Item By Id (SQL Error)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        ListItemDAO.deleteListItemById = jest.fn().mockImplementation((itemId: number) => {
            return mockDeleteListItemById(itemId, false, true);
        })

        await tester.delete(`${todoListRouterLink}/1${listItemRouterLink}/1`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(500)
        .then((res) => {
            expect(res).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.deleteListItemById).toBeCalledTimes(1);
            expect(ListItemDAO.deleteListItemById).toBeCalledWith(1);
        });
    });

    test("Deleting an Item By Id (Item Doesn't exist)", async () => {
        addCookieToResponseSpy.mockImplementation((res: Response, payload: User) => {
            mockAddCookieToResponse(res, payload);
        });

        verifyAndRefreshJWTFromRequestCookieSpy.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            mockVerifyAndRefreshJWTFromRequestCookie(req, res, next, true);
        });

        ListItemDAO.deleteListItemById = jest.fn().mockImplementation((itemId: number) => {
            return mockDeleteListItemById(itemId, false);
        })

        await tester.delete(`${todoListRouterLink}/1${listItemRouterLink}/1`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(404)
        .then((res) => {
            expect(res).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            checkAddCookieToResponse();
            checkIfUserSessionCookieIsPresent(res);
            checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled();

            expect(ListItemDAO.deleteListItemById).toBeCalledTimes(1);
            expect(ListItemDAO.deleteListItemById).toBeCalledWith(1);
        });
    });
});