import TodoList from "../models/todoList/TodoList.model";
import { users } from "./users.data";

export const todoLists: Array<TodoList> = users.map((user, index) => {
    return {
        id: index,
        name: `List ${index}`,
        createdOnDate: new Date(),
        lastUpdatedDate: new Date(),
        createdBy: user.id
    };
});