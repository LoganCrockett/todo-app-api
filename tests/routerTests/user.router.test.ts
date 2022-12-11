const server = require("../../server");
import supertest from "supertest";
import NewUserData from "../../models/request/NewUserData.model";
import ResponseBody from "../../models/response/responseBody.model";
import UserDao from "../../dao/user.dao";
import User from "../../models/users/user.model";

const tester = supertest(server);
const userRouterLink: string = "/api/user";

afterEach(() => {
    jest.clearAllMocks();
})

describe("User Router (Valid Data)", () => {
    test("Creating New User", async () => {
        const newUserData: NewUserData = {
            email: "example@email.com",
            password: "P@ssword1234",
            firstName: "Test",
            lastName: "User"
        };

        UserDao.createUser = jest.fn().mockImplementation((): Promise<ResponseBody<User>> => {
            return Promise.resolve({
                data: {
                    ...newUserData,
                    id: 1,
                    createdOnDate: new Date()
                }
            });
        });

        await tester.post(userRouterLink)
        .set("Content-Type", "application/json")
        .send(newUserData)
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            expect(UserDao.createUser).toHaveBeenCalledTimes(1);
            expect(UserDao.createUser).toHaveBeenCalledWith(newUserData.email, newUserData.password, newUserData.firstName, newUserData.lastName);
        });
    });

    test.todo("User Log In");

    test.todo("Getting User by Id");

    test.todo("Updating user by Id");
    
});

const invalidNewUserData: NewUserData[] = [
    undefined,
    {
        email: undefined,
        password: "password",
        firstName: "First Name",
        lastName: "Last Name"
    },
    {
        email: "string",
        password: "password",
        firstName: "First Name",
        lastName: "Last Name"
    },
    {
        email: "example@email.com",
        password: undefined,
        firstName: "First Name",
        lastName: "Last Name"
    },
    {
        email: "example@email.com",
        password: "",
        firstName: "First Name",
        lastName: "Last Name"
    },
    {
        email: "example@email.com",
        password: "password",
        firstName: undefined,
        lastName: "Last Name"
    },
    {
        email: "example@email.com",
        password: "P@ssword123",
        firstName: "",
        lastName: "Last Name"
    },
    {
        email: "example@email.com",
        password: "P@ssword123",
        firstName: "First Name",
        lastName: undefined
    },
    {
        email: "example@email.com",
        password: "P@ssword123",
        firstName: "First Name",
        lastName: ""
    }
];

describe("User Router (Invalid Data)", () => {

    test.each(invalidNewUserData)("Creating New User (Invalid)", async (inputData) => {
        await tester.post(userRouterLink)
        .set("Content-Type", "application/json")
        .send(inputData)
        .expect("Content-Type", /json/)
        .expect(400)
        .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toMatch("string");

            expect(UserDao.createUser).not.toBeCalled();
        })
    });

    test.todo("User Log In");

    test.todo("Getting User by Id");

    test.todo("Updating user by Id");

});
