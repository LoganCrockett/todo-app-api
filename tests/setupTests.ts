import sql from "../db";

afterAll(() => {
    sql.end();
});