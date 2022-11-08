const server = require("../../server");
const supertest = require("supertest");

describe("Testing Default Catch All Route", () => {
    test("Catch All Route", async () => {
        await supertest(server).get("/v1/some-route-that-doesnt-exist")
        .expect(404);
    });
});