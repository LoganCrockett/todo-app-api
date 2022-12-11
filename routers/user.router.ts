import { Router, Request, Response } from "express";
import NewUserData from "../models/request/NewUserData.model";
import ResponseBody from "../models/response/responseBody.model";
import UserDAO from "../dao/user.dao";

// Should match to /user
const UserRouter: Router = Router({
    caseSensitive: true
});

UserRouter.post("", async (req: Request, res: Response<ResponseBody<string>>) => {
    if (req.body === undefined || req.body === null) {
        res.status(400).json({
            data: "Request body cannot be null"
        });
        return;
    }

    const { email, password, firstName, lastName }: NewUserData = req.body;

    // Using email regex from https://regexr.com/3e48o
    const emailRegex: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    
    /**
     * Matches the following criteria:
     * - At Least One Uppercase letter
     * - At Least One Lowercase Letter
     * - At Least One Number
     * - At Least One Special Character
     */
    const passwordRegex: RegExp = /(?=.*[A-Z]+)(?=.*[a-z]+)(?=.*[0-9]+)(?=.*[\ !\"#$%&\'()*+,-./:;<=>?@\[\\\]^_`{|}~])(.){8,}/g;

    if (email === undefined || email === null || email === "") {
        res.status(400).json({
            data: "Email cannot be empty"
        });
        return;
    }
    else if (email.search(emailRegex) === -1) {
        res.status(400).json({
            data: "Invalid email format detected"
        });
        return;
    }

    if (password === undefined || password === null || password === "") {
        res.status(400).json({
            data: "Password cannot be empty"
        });
        return;
    }
    else if (password.search(passwordRegex) === -1) {
        res.status(400).json({
            data: "Invalid password format detected"
        });
        return;
    }
    
    if (firstName === undefined || firstName === null || firstName === "") {
        res.status(400).json({
            data: "First Name cannot be empty"
        });
        return;
    }

    if (lastName === undefined || lastName === null || lastName === '') {
        res.status(400).json({
            data: "Last Name cannot be empty"
        });
        return;
    }

    await UserDAO.createUser(email, password, firstName, lastName)
    .then((response) => {
        res.status(200).json({
            data: "Successfully created new user"
        });
    })
    .catch((err) => {
        res.status(500).json({
            data: "Unable to create new user account. Please try again"
        });
    });
});

export default UserRouter;
