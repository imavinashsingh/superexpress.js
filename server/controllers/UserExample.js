import UserExample from "../models/UserExample";

const { Router, Get, sendSuccess, sendError } = require("../lib/super_router");

@Router()
export default class Userexample {
    constructor() {
        this.users = new UserExample();
    }

    @Get()
    async sayhi(req, res, next) {
        try {
            const data = await this.users.getALLUsers().run(['1']);
            sendSuccess(res, data, null, 200);
        } catch (error) {
            sendError(res, error)
        }
    }
}