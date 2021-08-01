import { validateBodyMiddleware } from "../middleware/userMiddleware";
import UserModel from "../models/UserExample";

const { Router, Get, sendSuccess, sendError } = require("../lib/super_router");

@Router('/user')
export default class UserController {
    constructor() {
        this.users = new UserModel();
    } 

    @Get('/',[
        validateBodyMiddleware
    ])
    async getUser(req, res, next) {
        try {
            const data = await this.users.getALLUsers().run(['1']);
            sendSuccess(res, data, null, 200);
        } catch (error) {
            sendError(res, error)
        }
    }
}