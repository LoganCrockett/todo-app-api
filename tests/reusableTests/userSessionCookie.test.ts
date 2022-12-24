import { Response } from "supertest";

/**
 * Tests that the userSession cookie is being set on the response headers
 * @param res response to test
 */
export function checkIfUserSessionCookieIsPresent(res: Response) {
        // Make sure user was authenticated
        expect(res.headers["set-cookie"]).toBeDefined();
        expect(res.headers["set-cookie"]).toHaveLength(1);

        const setCookieHeaderValue: string = res.headers["set-cookie"][0];
        
        expect(setCookieHeaderValue).toContain("userSession");
};

/**
 * Tests that the userSession cookie is not being set on request headers
 * @param res response to test
 */
export function checkIfUserSessionCookieIsNotPresent(res: Response) {
        // Make sure we are not authenticating the user
        expect(res.headers["set-cookie"]).toBeUndefined();
}

test("Forcing one test in the file", () => {});