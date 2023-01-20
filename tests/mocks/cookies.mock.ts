import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import * as userAuthFunctions from "../../helperFunctions/cookies.helper";
import ResponseBody from "../../models/response/responseBody.model";
import User from "../../models/users/user.model";

export const addCookieToResponseSpy: jest.SpyInstance = jest.spyOn(userAuthFunctions, "addCookieToResponse");
export const verifyAndRefreshJWTFromRequestCookieSpy: jest.SpyInstance = jest.spyOn(userAuthFunctions, "verifyAndRefreshJWTFromRequestCookie");
export const verifyJWTTokenFromRequestCookieSpy: jest.SpyInstance = jest.spyOn(userAuthFunctions, "verifyJWTTokenFromRequestCookie");
export const getPayloadFromJWTSpy: jest.SpyInstance = jest.spyOn(userAuthFunctions, "getPayloadFromJWT");
export const verifyJWTTokenFromRequestCookieForLogoutSpy: jest.SpyInstance = jest.spyOn(userAuthFunctions, "verifyJWTTokenFromRequestCookieForLogout");

export const testUserForJWT: User = {
    id: 1,
    firstName: "Testing",
    lastName: "User",
    createdOnDate: new Date(),
    email: "example@email.com"
};

/**
 * Mocks the addCookieToResponse function
 * @param res response we are adding cookie to
 * @param payload payload to use for the cookie
 */
export function mockAddCookieToResponse(res: Response, payload: User): void {
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
        userAuthFunctions.addCookieToResponse(res, testUserForJWT);
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

    res.status(401).json({
        data: "user already logged in"
    });
    return;
};

/**
 * Mocks the return value for the verifyJWTTokenFromRequestCookieForLogout function
 * @param req request
 * @param res response
 * @param next next handler function
 * @param shouldBeSuccessful if we should return a successful value, or not
 * @returns 
 */
export function mockVerifyJWTTokenFromRequestCookieForLogout(req: Request, res: Response<ResponseBody<string>>, next: NextFunction, shouldBeSuccessful: boolean): void {
    if (shouldBeSuccessful) {
        next();
        return;
    }

    res.status(401).json({
        data: "user not logged in"
    });
    return;
};

/**
 * Mocks the return value for the getPayloadFromJWT function
 * @param req request
 * @param shouldReturnValue if we should return an example payload, or undefined
 * @returns example payload, or undefined
 */
export function mockGetPayloadFromJWT(req: Request, shouldReturnValue: boolean): JwtPayload | undefined {
    if (shouldReturnValue) {
        return testUserForJWT;
    }

    return undefined;
}
