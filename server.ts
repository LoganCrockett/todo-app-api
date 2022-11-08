require("dotenv-flow").config();
import express, { Express, Request, Response } from "express";
import v1Router from "./v1/v1Router";

const server: Express = express();
const port: string = process.env.PORT ?? "4000";

server.use("/v1", v1Router);

server.all("*", (req: Request, res: Response) => {
    return res.status(404).send("Not found");
});

server.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});