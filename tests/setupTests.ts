import sql from "../db";
import { users, userPasswordData } from "../mockData/users.data";
import argon2 from "argon2";
import { UserCredentials } from "../models/users/user.model";
import argon2Options from "../helperFunctions/argon2Options.helper";

beforeEach(async () => {
    const userPasswordHashData: UserCredentials[] = [];

    for (let i = 0; i < userPasswordData.length; i++) {
        await argon2.hash(userPasswordData[i].password, {
            ...argon2Options,
            raw: false
        })
        .then((hash) => {
            userPasswordHashData.push({
                ...userPasswordData[i],
                password: hash.toString()
            });
        });
    }

    await sql.begin(async (sql) => {
        await sql`insert into todo.users ${ sql(users, 'id', 'email', 'firstName', 'lastName', 'createdOnDate')}`;
        await sql`insert into todo."userCredentials" ${ sql(userPasswordHashData, "userId", "password")}`;
    })
    .catch((err) => {
        console.log("An error occured in setup. Exiting setup and skipping tests");
        console.log(err.message);
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
        console.log(err.message);
        sql.end();
    })
});

afterAll(() => {
    sql.end();
});