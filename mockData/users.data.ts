import User, { UserCredentials, UserIdsTest, UserPasswordDataTest, UserUpdatesTest } from "../models/users/user.model";

export const users: User[] = [
    {
        id: 1,
        email: "johnsmith@fakeemail.com",
        firstName: "John",
        lastName: "Smith",
        createdOnDate: new Date()
    },
    {
        id: 2,
        email: "janedoe@fakeemail.com",
        firstName: "Jane",
        lastName: "Doe",
        createdOnDate: new Date()
    }
];

export const userPasswordData: UserCredentials[] = users.map((user): UserCredentials => {
    return {
        userId: user.id,
        password: "password"
    };
});

export const emailAndPasswordData: UserPasswordDataTest[] = users.map((user, index) => {
    return {
        email: user.email,
        password: userPasswordData[index].password,
        expected: user
    }
});

emailAndPasswordData.push({
    email: "notauser@email.com",
    password: "thestrongestpassword",
    expected: undefined
});

export const userIds: UserIdsTest[] = users.map((user) => {
    return {
        id: user.id,
        expected: user
    };
});

// Should not exist
userIds.push({
    id: -4,
    expected: undefined
});

export const userUpdates: UserUpdatesTest[] = users.map((user) => {
    return {
        ...user,
        expected: user
    };
});

// Should Not exist
userUpdates.push({
    id: -4,
    firstName: "fake",
    lastName: "user",
    expected: undefined
});

export const userPasswordResetData = users.map((user, index) => {
    return {
        id: user.id,
        password: userPasswordData[index].password,
        newPassword: "newPassword",
        expected: true
    };
})

// Should Not Exist
userPasswordResetData.push({
    id: -1,
    password: "password",
    newPassword: "newPassword",
    expected: false
});