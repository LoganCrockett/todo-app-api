import express, { Express, Request, Response } from "express";
import UserRouter from "./routers/user.router";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const server: Express = express();
server.use(bodyParser.json());
server.use(cookieParser(process.env.COOKIE_SECRET));

server.use("/api/user", UserRouter);

server.all("*", (req: Request, res: Response) => {
    return res.status(404).send("Not found");
});

// Export server, so that when performing testing,
// we don't run into a port-in-use error
module.exports = server;