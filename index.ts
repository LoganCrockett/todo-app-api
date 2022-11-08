import { Express } from "express";
const server: Express = require("./server");

const port: string = process.env.PORT ?? "4000";

server.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});