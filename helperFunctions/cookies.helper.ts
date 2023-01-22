import fs from "fs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, Request, NextFunction, CookieOptions } from "express";
import ResponseBody from "../models/response/responseBody.model";
import User from "../models/users/user.model";

const privateKey = fs.readFileSync("./envFiles/private.pem");
const publicKey = fs.readFileSync("./envFiles/public.pem");

/**
 * Creates a JWT token, and adds it to the cookies in the Response object
 * @param res response to add cookie to
 * @param payload payload to create token for
 */
export function addCookieToResponse(res: Response, payload: User): void {
    const token = jwt.sign(payload, privateKey, {
            algorithm: "RS256",
            // 15 Minute Timeout
            expiresIn: "15m",
    });

    res.cookie("userSession", token, cookieOptions);

    return;
}

/**
 * Verifies that a given JWT cookie from a request is valid, and refreshes it
 * 
 * If so, it passes the request onto the next handler;
 * otherwise, it returns a 401 (Unaouthorized)
 * @param req req we are checking
 * @param res response object
 * @param next next function to call if we finish with all of our checks
 */
export function verifyAndRefreshJWTFromRequestCookie(req: Request, res: Response<ResponseBody<string>>, next: NextFunction) {
    const token = req.signedCookies.userSession;

    if (!token) {
        res.status(401).json({
            data: "user not logged in"
        });
        return;
    }

    try {
        const decoded: JwtPayload = jwt.verify(token, publicKey, {
            maxAge: "15m"
        }) as JwtPayload;

        if (!decoded) {
            res.status(401).json({
                data: "user not logged in"
            });
            return;
        }

        // Return back to basic payload before re-sign
        delete decoded.iat;
        delete decoded.exp;

        addCookieToResponse(res, decoded as User);

        // If decoded has a value, then the JWT is valid
        // Pass to the next handler
        next();
    } catch (err) {
        res.status(401).json({
            data: "user not logged in"
        });
        return;
    }
};

/**
 * Verifies that a JWT cookie from a request is valid (Used only for the inital login route)
 * 
 * If there is a valid token present, then returns a status code of 401
 * 
 * @param req  request we are checking
 * @param res response object
 * @param next next function to call if we finish with all of our checks
 */
export function verifyJWTTokenFromRequestCookie(req: Request, res: Response<ResponseBody<string>>, next: NextFunction) {
    const token = req.signedCookies.userSession;

    // No token present means we need to login
    if (!token) {
        next();
        return;
    }

    try {
        const decoded: JwtPayload = jwt.verify(token, publicKey, {
            maxAge: "15m"
        }) as JwtPayload;

        // If not defined, we need to login
        if (!decoded) {
            next();
            return;
        }

        // If it is a valid token, the user has already logged in.
        // Return an Unauthorized (401)
        res.status(401).json({
            data: "user already logged in"
        });
        return;
    } catch (err) {
        // No valid token means we need to login
        next();
        return;
    }
};

/**
 * Verifies that a JWT token is not present for the logout route
 * 
 * If there is not a token, then returns a status code of 401
 * @param req request
 * @param res response
 * @param next next function
 */
export function verifyJWTTokenFromRequestCookieForLogout(req: Request, res: Response<ResponseBody<string>>, next: NextFunction) {
    const token = req.signedCookies.userSession;

    // No token present means user is not logged in
    if (!token) {
        return res.status(401).json({
            data: "user not logged in"
        });
    }

    try {
        const decoded: JwtPayload = jwt.verify(token, publicKey, {
            maxAge: "15m"
        }) as JwtPayload;

        // If not defined, return 401
        if (!decoded) {
            return res.status(401).json({
                data: "user not logged in"
            });
        }

        // If it is a valid token, the user needs to logout
        // Call next function
        next();
        return;
    } catch (err) {
        // No valid token means we need to retunr 401
        return res.status(401).json({
            data: "user not logged in"
        });
    }
};

/**
 * Retrieves tha Payload from a JWT token (in this case, should be current user object)
 * @param req request we are retrieving token from
 * @returns Token payload, or undefined if not present/an error occurs
 */
export function getPayloadFromJWT(req: Request): undefined | JwtPayload {
    const token = req.signedCookies.userSession;

    if (!token) {
        return undefined;
    }
    try {
        return jwt.verify(token, publicKey, {
            maxAge: "15m"
        }) as JwtPayload;
    } catch (err) {
        return undefined;
    }
}

export const cookieOptions: CookieOptions = {
    // 15 Minute timeout
    maxAge: 15 * 60 * 1000,
    signed: true,
    sameSite: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.SERVER_ENV === "production"
};