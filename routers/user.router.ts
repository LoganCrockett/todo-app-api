import { Router, Request, Response } from "express";

// Should match to /user
const UserRouter: Router = Router({
    caseSensitive: true
});

export default UserRouter;
