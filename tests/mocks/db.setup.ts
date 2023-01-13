import sql from "../../db";
import argon2 from "argon2";
import argon2Options from "../../helperFunctions/argon2Options.helper";
import { userPasswordData, users } from "../../mockData/users.data";
import { UserCredentials } from "../../models/users/user.model";
import { todoLists } from "../../mockData/todoList.data";

/**
 * Inserts user's data & their credentials into the DB for testing;
 */
export async function insertUsersAndCredentials() {
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
        console.log("An error occured while inserting users");
        console.log(err.message);
        sql.end();
    });
}

/**
 * Removes user's and their credentials from the DB for testing
 */
export async function removeUsersAndCredentials() {
    await sql.begin(async (sql) => {
        await sql`delete from todo."userCredentials"`;
        await sql`delete from todo.users`;
    })
    .catch((err) => {
        console.log("An error occured in teardown. Exiting Teardown.");
        console.log(err.message);
        sql.end();
    })
}

/**
 * Inserts todo lists into the DB for testing
 */
export async function insertTodoLists() {
    await sql.begin(async () => {
        await sql`insert into todo.list ${ sql(todoLists, "id", "name", "createdOnDate", "lastUpdatedDate", "createdBy") }`;
    })
    .catch((err) => {
        console.log("An error occured while inserting lists");
        console.log(err.message);
        sql.end();
    });
}

/**
 * Removes todo lists from the DB for testing
 */
export async function removeTodoLists() {
    await sql.begin(async () => {
        await sql`delete from todo.list`;
    })
    .catch((err) => {
        console.log("An error occured while removing lists");
        console.log(err.message);
        sql.end();
    });
}