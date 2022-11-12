import sql from "../db";
import { users, userPasswordData } from "../mockData/users.data";

beforeEach(async () => {
    await sql.begin(async (sql) => {
        await sql`insert into todo.users ${ sql(users, 'id', 'email', 'firstName', 'lastName', 'createdOnDate')}`;
        await sql`insert into todo."userCredentials" ${ sql(userPasswordData, "userId", "password")}`;
    })
    .catch((err) => {
        console.log("An error occured in setup. Exiting setup and skipping tests");
        console.log(err);
        sql.end();
    });
});

afterEach(async () => {
    await sql.begin(async (sql) => {
        await sql`delete from todo."userCredentials"`;
        await sql`delete from todo.users`;
    })
    .catch((err) => {
        console.log("An error occured in teardown. Exiting Teardown.");
        console.log(err);
        sql.end();
    })
});

afterAll(() => {
    sql.end();
});