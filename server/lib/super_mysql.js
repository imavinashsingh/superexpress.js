import mysql from 'mysql';
import dotenv from 'dotenv'
dotenv.config();
export class SuperMysql {
    pool
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.MYSQL_Host,
            user: process.env.MYSQL_User,
            password: process.env.MYSQL_Password,
            database: process.env.MYSQL_Database,
            port: process.env.MYSQL_Port,
            waitForConnections: true,
            connectionLimit: process.env.MYSQL_ConnectionLimit,
            queueLimit: process.env.MYSQL_QueueLimit,
            debug: false
        });
    }

    rawQuery(query, args) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                try {
                    if (err) {
                        console.error(`[sprocs][base][getConnection] err:${err.message}`);
                        return reject(err);
                    } else {
                        conn.query({
                            sql: query,
                            values: args
                        }, (err, result, fields) => {
                            if (err) {
                                console.error(`[sprocs][base][getConnection][conn.query] err: ${err.message}`);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    }
                } catch (error) {

                }
            });
        });
    }


    connection_query(query, res = null) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                try {
                    if (err) {
                        console.error(`[sprocs][base][getConnection] err:${err.message}`);
                        return reject(err);
                    } else {
                        conn.query(query, (err, result, fields) => {
                            //this.pool.releaseConnection(conn);
                            if (err) {
                                console.error(`[sprocs][base][getConnection][conn.query] err: ${err.message}`);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    }
                } catch (err) {
                    console.error(`[sprocs][base][getConnection][conn.query] catch err:${err.message}`);
                    return reject(err);
                } finally {
                }
            })
        })
    }

    pool_query(args, sproc_name) {
        return new Promise((resolve, reject) => {

            const newArgs = args.map(item => item != undefined ? `"${item}"` : `""`);
            const query = `CALL ${sproc_name}(${newArgs})`

            this.pool.query(query, (err, result, fields) => {
                if (err) {
                    console.error(`[sprocs][base][pool_query] err:${err.message}`);
                    return reject(err);
                }
                resolve(result);
            });
        });
    }
    drop_query(sproc_name, res = null) {
        return new Promise((resolve, reject) => {

            const query = `DROP PROCEDURE IF EXISTS ${sproc_name};`
           // console.info(`[sprocs][base][drop_query] query:` + JSON.stringify(query));

            this.pool.query(query, (err, result, fields) => {
                if (err) {
                    console.error(`[sprocs][base][drop_query] err:${err.message}`);
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

    connection_close() {
        return new Promise((resolve, reject) => {
            this.pool.end(err => {
                if (err)
                    return reject(err);
                resolve('');
            });
        });
    }

}

export const MySQLModel = () => {
    return (target) => {
        if (!Reflect.hasMetadata('entity', target)) {
            const data = []
            Reflect.defineMetadata('entity', data, target);
        }
        if (!Reflect.hasMetadata('entity_query', target)) {
            const data = []
            Reflect.defineMetadata('entity_query', data, target);
        }
    };
};

export const sp = () => {
    return (target, propertyKey, descriptor) => {
        if (!Reflect.hasMetadata('entity', target.constructor)) {
            const data = []
            Reflect.defineMetadata('entity', data, target.constructor);
        }
        const sp = Reflect.getMetadata('entity', target.constructor);
        sp.push({
            sp_method_name: propertyKey
        })
        Reflect.defineMetadata('entity', sp, target.constructor);
        const originalMethod = descriptor.value;
        descriptor.value = (...args) => {
            const result = originalMethod.apply(this, args);
            const run = (args) => {
                return new SuperMysql().pool_query(args, propertyKey);
            }
            result.run = run;
            if (!result.createProcedure && !result.query) {
                throw new Error("Missing required argument.");
            }
            return result;
        }
    }
}

export const rawQuery = () => {
    return (target, propertyKey, descriptor) => {
        if (!Reflect.hasMetadata('entity_query', target.constructor)) {
            const data = []
            Reflect.defineMetadata('entity_query', data, target.constructor);
        }
        const query = Reflect.getMetadata('entity_query', target.constructor);
        query.push({
            query_method_name: propertyKey
        });

        Reflect.defineMetadata('entity_query', query, target.constructor);

        const originalMethod = descriptor.value;

        descriptor.value = (...args) => {
            const result = originalMethod.apply(this, args);
            if (!result.query) { //!
                console.error(`Expected query arguments of type queryResponse`);
                throw new Error(`Expected query arguments of type queryResponse`);
            }
            const run = (args) => {
                const count = result.query.split("?").length - 1;
                if (count > 0 && !args) {
                    console.error(`${propertyKey}():Expected ${count} arguments, but got 0.`);
                    throw new Error(`${propertyKey}():Expected ${count} arguments, but got 0.`);
                }
                if (count != args.length) {
                    console.error(`${propertyKey}():Expected ${count} arguments, but got ${args.length}.`);
                    throw new Error(`${propertyKey}():Expected ${count} arguments, but got ${args.length}.`);
                }
                return new SuperMysql().rawQuery(result.query, args);
            }
            result.run = run;
            return result;
        }
    }
}


/**
 * @param {[()=>void]} models 
 */
export async function loadModels(models) {
    let controllers = models;
    for (let controller of controllers) {
        // This is our instantiated class
        const instance = new controller();
        const entities_controller = Reflect.getMetadata('entity', controller);
        for (let e of entities_controller) {
            const result = instance[e.sp_method_name]();
            try {
                await new SuperMysql().drop_query(e.sp_method_name);
                const proc = `CREATE PROCEDURE ${e.sp_method_name}(
                ${result.args}
              )
              BEGIN
                 ${result.query}
              END`;
                await new SuperMysql().connection_query(proc);
            } catch (error) {
                console.error(error)
                throw new Error(error)
            }

        }
    }

}