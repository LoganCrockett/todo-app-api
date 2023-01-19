import { NextFunction, Request, Response, Router } from "express";
import ListItemDAO from "../dao/listItem.dao";
import { checkStringValidity } from "../helperFunctions/validationFunctions.helper";
import ListItem from "../models/listItems/ListItem.model";
import ResponseBody from "../models/response/responseBody.model";

/*
 * Note: We shouldn't have to test if the list id
 * is valid in this router, as the todoListRouter
 * has an interceptor built into it that does this
 */

// Should map to /list/:listId/item
const ListItemRouter: Router = Router({
    caseSensitive: true,
    mergeParams: true
});

ListItemRouter.use("/:itemId", (req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
    if (Number.isNaN(Number.parseInt(req.params.itemId))) {
        return res.status(400).json({
            data: "item id cannot be null"
        });
    }

    next();
});

/**
 * Creates a new list item
 */
ListItemRouter.post("", async (req: Request, res: Response<ResponseBody<string| ListItem>>, next: NextFunction) => {
    const description = req.body.description;
    const listId = Number.parseInt(req.params.listId);

    if (!checkStringValidity(description)) {
        return res.status(400).json({
            data: "Description cannot be null"
        });
    }

    await ListItemDAO.createListItem(listId, description)
    .then((listItem) => {
        return res.status(200).json({
            data: listItem
        });
    })
    .catch((err) => {
        return res.status(500).json({
            data: "An unexpected error occured. Please try again"
        });
    })
});

/**
 * Gets an array of ListItems by list id
 */
ListItemRouter.get("", async (req: Request, res: Response<ResponseBody<string | Array<ListItem>>>, next: NextFunction) => {
    const listId: number = Number.parseInt(req.params.listId);

    await ListItemDAO.getListItemsByListId(listId)
    .then((listItems: ListItem[]) => {
        return res.status(200).json({
            data: listItems
        });
    })
    .catch((err) => {
        return res.status(500).json({
            data: "An unexpected error occured. Please try again"
        });
    })
});

/**
 * Updates a List item by id
 */
ListItemRouter.put("/:itemId", async (req: Request, res: Response<ResponseBody<string | ListItem>>, next: NextFunction) => {
    const itemId: number = Number.parseInt(req.params.itemId);
    const newDescription: string = req.body.description;

    if (!checkStringValidity(newDescription)) {
        return res.status(400).json({
            data: "Invalid format for description"
        });
    }

    await ListItemDAO.updateListItemById(itemId, newDescription)
    .then((updatedItem) => {
        if (updatedItem === undefined) {
            return res.status(404).json({
                data: "Item not found"
            });
        }

        return res.status(200).json({
            data: updatedItem
        });
    })
    .catch((err) => {
        return res.status(500).json({
            data: "An unexpected error occured. Please try again"
        });
    })
});

ListItemRouter.delete("/:itemId", async (req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
    const itemId: number = Number.parseInt(req.params.itemId);

    await ListItemDAO.deleteListItemById(itemId)
    .then((wasSuccessful) => {
        if (!wasSuccessful) {
            return res.status(404).json({
                data: "Item does not exist"
            });
        }

        return res.status(200).json({
            data: "Successfully removed item"
        });
    })
    .catch((err) => {
        return res.status(500).json({
            data: "An unexpected error occured. Please try again"
        });
    })
});

export default ListItemRouter;