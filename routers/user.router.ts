import { Router, Request, Response, NextFunction } from "express";
import NewUserData from "../models/request/user/NewUserData.model";
import ResponseBody from "../models/response/responseBody.model";
import UserDAO from "../dao/user.dao";
import UserLoginCredentials from "../models/request/user/UserLoginCredentials.model";
import { addCookieToResponse, verifyAndRefreshJWTFromRequestCookie, verifyJWTTokenFromRequestCookie } from "../helperFunctions/cookies.helper";
import User from "../models/users/user.model";
import UpdateUserData from "../models/request/user/UpdateUserData.model";

// Should match to /user
const UserRouter: Router = Router({
    caseSensitive: true
});

/**
 * Creates a new user
 * 
 * *Note:* We **ARE NOT** authenticating the user on this request. They will have to log in on a separate request
 */
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

/**
 * Log a user in (if they have the correct credentials)
 */
UserRouter.post("/login", (req: Request, res: Response, next: NextFunction) => {
    verifyJWTTokenFromRequestCookie(req, res, next);
}, async (req: Request, res: Response<ResponseBody<string>>) => {
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

        addCookieToResponse(res, response);

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
 * Get a user's data by their id
 */
UserRouter.get("/:id", (req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
    verifyAndRefreshJWTFromRequestCookie(req, res, next);
} , async (req: Request, res: Response<ResponseBody<string | User>>) => {

    const paramId: number = Number.parseInt(req.params.id);
    
    if (Number.isNaN(paramId)) {
        res.status(400).json({
            data: "invalid id format detected"
        });
        return;
    }

    await UserDAO.getUserById(paramId)
    .then((user) => {
        if (user === undefined) {
            res.status(404).json({
                data: "user not found"
            });
            return;
        }

        res.status(200).json({
            data: user
        });
    })
    .catch((err) => {
        res.status(500).json({
            data: "An unexpected error occured. Please try again"
        });
    });
});

/**
 * Update a user's data by their id
 */
UserRouter.put("/:id", (req: Request, res: Response<ResponseBody<string>>, next: NextFunction) => {
    verifyAndRefreshJWTFromRequestCookie(req, res, next);
}, async (req: Request, res: Response<ResponseBody<string | User>>) => {
    const paramId: number = Number.parseInt(req.params.id);

    if (Number.isNaN(paramId)) {
        res.status(400).json({
            data: "invalid id format detected"
        });
        return;
    }

    const { firstName, lastName }: UpdateUserData = req.body;

    if (!checkStringValidity(firstName)) {
        return res.status(400).json({
            data: "invalid first name format"
        });
    }

    if (!checkStringValidity(lastName)) {
        return res.status(400).json({
            data: "invalid last name format"
        });
    }

    await UserDAO.updateUserById(paramId, firstName, lastName)
    .then((updatedUser) => {
        if (updatedUser === undefined) {
            return res.status(404).json({
                data: "Ok"
            });
        }

        return res.status(200).json({
            data: updatedUser
        });
    })
    .catch((err) => {
        return res.status(500).json({
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

/**
 * Checks if a given string is valid (Defined, and at least one character)
 * @param toCheck string to check
 * @returns true if it is valid, else false
 */
const checkStringValidity = (toCheck: string): boolean => {
    return toCheck !== undefined && toCheck !== null && toCheck !== "undefined" && toCheck !== "null" && toCheck.length > 1;
}

export default UserRouter;
