import ListItem from "../models/listItems/ListItem.model";
import { todoLists } from "./todoList.data";

let i = 1;

export const listItems: ListItem[] = [];
todoLists.forEach((list) => {
    for (let j = 1; j < 4; j++) {
        listItems.push({
            id: i,
            listId: list.id,
            description: "Here is some example text for an item",
            createdOnDate: new Date()
        });
        i++;
    }
});