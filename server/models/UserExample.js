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
    getUserAvi() {
        return {
            args: ``,
            query: `
      SELECT * FROM taptwointeract.user;
      `
        }
    }

    @sp()
    getUserDetailsAvi(){
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