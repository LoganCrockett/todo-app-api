import { Router, Request, Response } from "express";
import NewUserData from "../models/request/user/NewUserData.model";
import ResponseBody from "../models/response/responseBody.model";
import UserDAO from "../dao/user.dao";
import UserLoginCredentials from "../models/request/user/UserLoginCredentials.model";

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

    if (!checkEmailValidity(email)) {
        res.status(400).json({
            data: "Invalid email format detected"
        });
        return;
    }

    if (!checkPasswordValidity(password)) {
        res.status(400).json({
            data: "Password cannot be empty"
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

UserRouter.post("/login", async (req: Request, res: Response<ResponseBody<string>>) => {
    if (req.body === undefined || req.body === null) {
        res.status(400).json({
            data: "Request body cannot be empty"
        });
        return;
    }
    
    const { email, password }: UserLoginCredentials = req.body;

    if (!checkEmailValidity(email)) {
        res.status(400).json({
            data: "Invalid email format detected"
        });
        return;
    }

    if (!checkPasswordValidity(password)) {
        res.status(400).json({
            data: "Invlaid password format detected"
        });
        return;
    }

    await UserDAO.checkUserCredentialsForLogin(email, password)
    .then((response) => {
        if (response === undefined) {
            res.status(400).json({
                data: "Invalid email or password detected"
            });
            return;
        }

        res.status(200).json({
            data: "Successfully logged in"
        });
    })
    .catch((err) => {
        res.status(500).json({
            data: "An unexpected error occured. Please try again"
        });
    });
});

/**
 * Checks if a given email is the valid format
 * @param email email to check
 * @returns true if it is a valid email format, else false
 */
const checkEmailValidity = (email: string): boolean => {
    // Using email regex from https://regexr.com/3e48o
    const emailRegex: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    return email !== undefined && email !== null && email.search(emailRegex) !== -1;
};

/**
 * Checks if a given password matches the given criteria
 * @param password password to test
 * @returns true if it is a valid password meeting all of the criteria, else false
 */
const checkPasswordValidity = (password: string): boolean => {
    /**
     * Matches the following criteria:
     * - At Least One Uppercase letter
     * - At Least One Lowercase Letter
     * - At Least One Number
     * - At Least One Special Character
     * - At least 8 characters in length
     */
    const passwordRegex: RegExp = /(?=.*[A-Z]+)(?=.*[a-z]+)(?=.*[0-9]+)(?=.*[\ !\"#$%&\'()*+,-./:;<=>?@\[\\\]^_`{|}~])(.){8,}/g;
    return password !== undefined && password !== null && password.search(passwordRegex) !== -1;
};

export default UserRouter;
