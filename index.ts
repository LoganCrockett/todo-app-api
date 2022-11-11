import { Express } from "express";
import sql from "./db";
const server: Express = require("./server");

const port: string = process.env.PORT ?? "4000";

const toClose = server.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});

process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Shutting down server");
    await sql.end();

    toClose.close(() => {
        console.log("Server shut down complete");
    })
});