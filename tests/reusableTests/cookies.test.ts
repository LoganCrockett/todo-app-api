import { addCookieToResponseSpy, verifyAndRefreshJWTFromRequestCookieSpy, verifyJWTTokenFromRequestCookieSpy } from "../mocks/cookies.mock";

/**
 * The purpose of this function is to act as a re-usable
 * test for the **addCookieToResponseSpy**
 */
export function checkAddCookieToResponse() {
    expect(addCookieToResponseSpy).toHaveBeenCalledTimes(1);
    expect(addCookieToResponseSpy).toReturn();
}

/**
 * The purpose of this function is to check if
 * the **addCookieToResponseSpy** was not called
 */
export function checkAddCookieToResponseWasNotCalled() {
    expect(addCookieToResponseSpy).toHaveBeenCalledTimes(0);
    expect(addCookieToResponseSpy).not.toReturn();
}

/**
 * Verify that the verifyJWTToeknFromRequestCookieSpy was called
 * 
 * **FOR INTIAL LOGIN ROUTES ONLY**
 */
export function checkVerifyJWTTokenFromRequestCookieSpyWasCalled() {
    expect(verifyJWTTokenFromRequestCookieSpy).toHaveBeenCalledTimes(1);
    expect(verifyJWTTokenFromRequestCookieSpy).toReturn();
}

/**
 * Verify that the verifyJWTToeknFromRequestCookieSpy was not called
 * 
 * **FOR INTIAL LOGIN ROUTES ONLY**
 */
export function checkVerifyJWTTokenFromRequestCookieSpyWasNotCalled() {
    expect(verifyJWTTokenFromRequestCookieSpy).toHaveBeenCalledTimes(0);
    expect(verifyJWTTokenFromRequestCookieSpy).not.toReturn();
}

/**
 * Verify that the verifyAndRefreshJWTTokenFromRequestCookieSpy was called
 */
export function checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasCalled() {
    expect(verifyAndRefreshJWTFromRequestCookieSpy).toHaveBeenCalledTimes(1);
    expect(verifyAndRefreshJWTFromRequestCookieSpy).toReturn();
}

/**
 * Verify that the verifyAndRefreshJWTTokenFromRequestCookieSpy was not called
 */
export function checkVerifyAndRefreshJWTTokenFromRequestCookieSpyWasNotCalled() {
    expect(verifyAndRefreshJWTFromRequestCookieSpy).toHaveBeenCalledTimes(0);
    expect(verifyAndRefreshJWTFromRequestCookieSpy).not.toReturn();
}

test("Forcing one test in file" , () => {});