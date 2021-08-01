import express from 'express';

var r = express.Router();


/**
 * 
 * @param {string} prefix 
 * @param {[function(req: Request, res: Response, next: NextFunction){}]} middleware 
 * @returns 
 */
export function Router(prefix = '/', middleware = []) {
  return (target) => {
    Reflect.defineMetadata('prefix', prefix, target);

    // Since routes are set by our methods this should almost never be true (except the controller has no methods)
    if (!Reflect.hasMetadata('routes', target)) {
      Reflect.defineMetadata('routes', [], target);
    }
    if (!Reflect.hasMetadata('mw', target)) {
      Reflect.defineMetadata('mw', [], target);
    }

    if (middleware) {
      Reflect.defineMetadata('mw', middleware, target);
    }

  };
};

// Decorator/Get.ts
/**
 * This is used to convert into get API
 * @param {string} path   default-"/"
 * @param {[function(req: Request, res: Response, next: NextFunction){}]} middleware
 * @returns 
 */
export function Get(path = "/", middleware = []) {
  // `target` equals our class, `propertyKey` equals our decorated method name
  return (target, propertyKey) => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor);

    routes.push({
      requestMethod: 'get',
      path,
      methodName: propertyKey,
      mw: middleware
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};
/**
 * This is used to convert into get API
 * @param {string} path   default-"/"
 * @param {[function(req: Request, res: Response, next: NextFunction){}]} middleware
 * @returns 
 */
export function Put(path = "/", middleware = []) {
  // `target` equals our class, `propertyKey` equals our decorated method name
  return (target, propertyKey) => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor);

    routes.push({
      requestMethod: 'put',
      path,
      methodName: propertyKey,
      mw: middleware
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};

/**
 * This is used to convert into get API
 * @param {string} path   default-"/"
 * @param {[function(req: Request, res: Response, next: NextFunction){}]} middleware
 * @returns 
 */
export function Post(path = "/", middleware = []) {
  // `target` equals our class, `propertyKey` equals our decorated method name
  return (target, propertyKey) => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor);

    routes.push({
      requestMethod: 'post',
      path,
      methodName: propertyKey,
      mw: middleware
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};

/**
 * This is used to convert into get API
 * @param {string} path   default-"/"
 * @param {[function(req: Request, res: Response, next: NextFunction){}]} middleware
 * @returns 
 */
export function Delete(path = "/", middleware = []) {
  // `target` equals our class, `propertyKey` equals our decorated method name
  return (target, propertyKey) => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor);

    routes.push({
      requestMethod: 'delete',
      path,
      methodName: propertyKey,
      mw: middleware
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};

/**
 * 
 * @param {*} controllers 
 * @returns router
 */
export function loadControllers(controllers = []) {
  controllers.forEach(controller => {
    const instance = new controller();
    const prefix = Reflect.getMetadata('prefix', controller);
    const routes = Reflect.getMetadata('routes', controller);
    const mw = Reflect.getMetadata('mw', controller);
    if (mw.length)
      r.use(prefix, mw);
    routes.forEach(route => {
      if (route.mw.length)
        r[route.requestMethod](prefix + route.path, route.mw, (req, res, next) => {
          instance[route.methodName](req, res, next);
        });
      else
        r[route.requestMethod](prefix + route.path, (req, res, next) => {
          instance[route.methodName](req, res, next);
        });
    });
  });
  return r;
};

export const sendSuccess = (res, data, message = null, status = 200) => {
  return res.status(status).json({
    message: message || 'success',
    data: data
  });
};

export const sendError = (res, message = null, status = 500) => {
  console.warn(res, message || 'internal server error');
  return res.status(status).json({
    message: message || 'internal server error',
  });
};