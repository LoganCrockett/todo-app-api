import express, { Express, Request, Response } from "express";

const server: Express = express();
const port: number = 4000;

server.get("/", (req: Request, res: Response) => {
    return res.send("Hello, world!!");
});

server.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});