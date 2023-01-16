import { Request, Response, NextFunction, Router } from "express";
import TodoListDAO from "../dao/todoList.dao";
import { getPayloadFromJWT, verifyAndRefreshJWTFromRequestCookie } from "../helperFunctions/cookies.helper";
import { checkStringValidity } from "../helperFunctions/validationFunctions.helper";
import Page from "../models/Page";
import PageParameters from "../models/request/PageParameters.model";
import NewTodoListData from "../models/request/todoList/NewTodoListData.model";
import ResponseBody from "../models/response/responseBody.model";
import TodoList from "../models/todoList/TodoList.model";
import User from "../models/users/user.model";

// Should match to /list
const TodoListRouter: Router = Router({
    caseSensitive: true
});

/**
 * Creates a new TodoList
 */
TodoListRouter.post("", (req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
    verifyAndRefreshJWTFromRequestCookie(req, res, next);
}, async (req: Request, res: Response<ResponseBody<string | TodoList>>, next: NextFunction) => {
    const { name }: NewTodoListData = req.body;

    if (!checkStringValidity(name)) {
        return res.status(400).json({
            data: "Inavlid name format detected"
        });
    }

    const currentLoggedInUser = getPayloadFromJWT(req) as User;

    if (currentLoggedInUser === undefined || currentLoggedInUser.id === undefined || currentLoggedInUser.id === null) {
        return res.status(500).json({
            data: " An unexpected error occured. Please try again."
        });
    }

    await TodoListDAO.createNewList(name, currentLoggedInUser.id)
    .then((newList) => {
        return res.status(200).json({
            data: newList
        });
    })
    .catch((err) => {
        return res.status(500).json({
            data: " An unexpected error occured. Please try again."
        });
    });
});

/**
 * Get's a page of list based of the creator id (AKA User)
 */
TodoListRouter.get("", (req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
    verifyAndRefreshJWTFromRequestCookie(req, res, next);
}, async (req: Request, res: Response<ResponseBody<string | Page<TodoList>>>, next: NextFunction) => {
    const currentLoggedInUser = getPayloadFromJWT(req) as User;

    if (currentLoggedInUser === undefined || currentLoggedInUser.id === undefined || currentLoggedInUser.id === null) {
        return res.status(500).json({
            data: " An unexpected error occured. Please try again."
        });
    }

    const parameters: PageParameters = {
        page: Number.parseInt(req.body.page),
        perPage: Number.parseInt(req.body.perPage)
    };

    if (Number.isNaN(parameters.page)) {
        return res.status(400).json({
            data: "page cannot be null"
        });
    }

    if (parameters.page < 1) {
        return res.status(400).json({
            data: "page cannot start before 1"
        });
    }

    if (Number.isNaN(parameters.perPage)) {
        return res.status(400).json({
            data: "perPage cannot be null"
        });
    }

    if (parameters.perPage < 1) {
        return res.status(400).json({
            data: "perPage cannot start before 1"
        });
    }

    await TodoListDAO.getListByPage(currentLoggedInUser.id, parameters.page, parameters.perPage)
    .then((pagedLists) => {
        return res.status(200).json({
            data: pagedLists
        });
    })
    .catch((err) => {
        return res.status(500).json({
            data: "An unexpected error occured. Please try again"
        });
    })
});

/**
 * Updates an existing TodoList by id
 */
TodoListRouter.put("/:id", (req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
    verifyAndRefreshJWTFromRequestCookie(req, res, next);
}, async (req: Request, res: Response<ResponseBody<string | TodoList>>, next: NextFunction) => {
    const listId: number = Number.parseInt(req.params.id);

    if (Number.isNaN(listId)) {
        return res.status(400).json({
            data: "Invalid Id format detected"
        });
    }

    const { name }: NewTodoListData = req.body;

    if (!checkStringValidity(name)) {
        return res.status(400).json({
            data: "Name cannot be blank"
        });
    }

    await TodoListDAO.updateListById(listId, name)
    .then((updatedList) => {
        if (updatedList === undefined) {
            return res.status(404).json({
                data: "list not found"
            });
        }

        return res.status(200).json({
            data: updatedList
        });
    })
    .catch((err) => {
        return res.status(500).json({
            data: "not found"
        });
    });
});

/**
 * Deletes an existing TodoList by id
 */
TodoListRouter.delete("/:id", (req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
    verifyAndRefreshJWTFromRequestCookie(req, res, next);
}, async (req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
    const listId: number = Number.parseInt(req.params.id);

    if (Number.isNaN(listId)) {
        return res.status(400).json({
            data: "Invalid Id format detected"
        });
    }

    await TodoListDAO.deleteListById(listId)
    .then((wasSuccessful) => {
        if (wasSuccessful) {
            return res.status(200).json({
                data: "Successfully removed list"
            });
        }

        return res.status(404).json({
            data: "List not found"
        });
    })
    .catch((err) => {
        return res.status(500).json({
            data: "An unexpected error occured. Please try again"
        });
    })
});

export default TodoListRouter;