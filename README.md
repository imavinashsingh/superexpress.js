# Super-express.js

An skeleton express app that allows you to use ES6 syntax and `Super Controller and Super Mysql` lib. Generated by express-generator cli.

## How to run

Before anything else, you must have node installed on your machine.

### Running Dev Server

Run on your terminal `npm run watch:dev`, the server will restart everytime you make a change in your code.

### Running Production Server

For stuff like heroku deployment, aws elasticbeanstalk, run `npm run start`

### Other scripts

* `transpile` - convert es6 and beyond code to es5 to a folder named `dist-server`
* `clean` - delete transpiled folder
* `build` - clean and transpile

## Example Controller 
`
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
`
## Example Model

`
import { MySQLModel, rawQuery ,sp} from "../lib/super_mysql";

@MySQLModel()
export default class UserExampleModel{
    @rawQuery()
    getALLUsers(){
        return {
            query:"select * from user where id=?"
        }
    }

    @sp()
    getUser() {
        return {
            args: ``,
            query: `
      SELECT * FROM taptwointeract.user;
      `
        }
    }

    @sp()
    getUserDetails(){
        const data={
            args:`
            IN f_email text,
            IN f_user_id int(11)`,
            query:`select *
            from user u
            where 
            (case 
                when f_user_id is not null then u.id = f_user_id
                else u.email = f_email
            end);`
        };
        return data
    }

}
`

