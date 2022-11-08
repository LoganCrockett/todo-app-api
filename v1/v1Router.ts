import { Router } from "express";
import UsersRouter from "./routers/UsersRouter";

const v1Router: Router = Router({
    caseSensitive: true
});

v1Router.use("/users", UsersRouter);

export default v1Router;