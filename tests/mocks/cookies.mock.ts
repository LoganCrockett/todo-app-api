import { Request, Response, NextFunction } from "express";
import * as userAuthFunctions from "../../helperFunctions/cookies.helper";
import ResponseBody from "../../models/response/responseBody.model";

export const addCookieToResponseSpy: jest.SpyInstance = jest.spyOn(userAuthFunctions, "addCookieToResponse");
export const verifyAndRefreshJWTFromRequestCookieSpy: jest.SpyInstance = jest.spyOn(userAuthFunctions, "verifyAndRefreshJWTFromRequestCookie");
export const verifyJWTTokenFromRequestCookieSpy: jest.SpyInstance = jest.spyOn(userAuthFunctions, "verifyJWTTokenFromRequestCookie");

/**
 * Mocks the addCookieToResponse function
 * @param res response we are adding cookie to
 * @param payload payload to use for the cookie
 */
export function mockAddCookieToResponse(res: Response, payload: {}): void {
    res.cookie("userSession", "example value", userAuthFunctions.cookieOptions);
};
/**
 * Mocks the return values for the verifyAndRefreshJWTFromRequestCookie function
 * @param req request
 * @param res response
 * @param next next handler function
 * @param shouldBeSuccessful if we should return a successful value, or not
 * @returns 
 */
export function mockVerifyAndRefreshJWTFromRequestCookie(req: Request, res: Response<ResponseBody<string>>, next: NextFunction, shouldBeSuccessful: boolean): void {
    if (shouldBeSuccessful) {
        userAuthFunctions.addCookieToResponse(res, {});
        next();
        return;
    }

    res.status(401).json({
        data: "user not logged in"
    });
    return;
};

/**
 * Mocks the return value for the verifyJWTTokenFromRequestCookie function
 * @param req request
 * @param res response
 * @param next next handler function
 * @param shouldBeSuccessful if we should return a successful value, or not
 * @returns 
 */
export function mockVerifyJWTTokenFromRequestCookie(req: Request, res: Response<ResponseBody<string>>, next: NextFunction, shouldBeSuccessful: boolean): void {
    if (shouldBeSuccessful) {
        next();
        return;
    }

    res.status(400).json({
        data: "user already logged in"
    });
    return;
};
