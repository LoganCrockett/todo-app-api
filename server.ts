require("dotenv-flow").config();
import express, { Express, Request, Response } from "express";
import v1Router from "./v1/v1Router";

const server: Express = express();

server.use("/v1", v1Router);

server.all("*", (req: Request, res: Response) => {
    return res.status(404).send("Not found");
});

// Export server, so that when performing testing,
// we don't run into a port-in-use error
module.exports = server;