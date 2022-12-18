import fs from "fs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, Request, NextFunction, CookieOptions } from "express";
import ResponseBody from "../models/response/responseBody.model";

const privateKey = fs.readFileSync("private.pem");
const publicKey = fs.readFileSync("public.pem");

/**
 * Creates a JWT token, and adds it to the cookies in the Response object
 * @param res response to add cookie to
 * @param payload payload to create token for
 */
export function addCookieToResponse(res: Response, payload: {}): void {
    const token = jwt.sign(payload, privateKey, {
            algorithm: "RS256",
            // 15 Minute Timeout
            expiresIn: "15m",
    });

    res.cookie("userSession", token, cookieOptions);

    return;
}

/**
 * Verifies that a given JWT cookie from a request is valid
 * 
 * If so, it passes the request onto the next handler;
 * otherwise, it returns a 401 (Unaouthorized)
 * @param req req we are checking
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

        addCookieToResponse(res, decoded);

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

export const cookieOptions: CookieOptions = {
    // 15 Minute timeout
    maxAge: 15 * 60 * 1000,
    signed: true,
    sameSite: true,
    httpOnly: true,
    // Comment out if testing locally
    secure: process.env.NODE_ENV === "production"
};