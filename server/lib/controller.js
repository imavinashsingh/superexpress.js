export function API(prefix = '',middleware=[]){
    return (target) => {
      Reflect.defineMetadata('prefix', prefix, target);
  
      // Since routes are set by our methods this should almost never be true (except the controller has no methods)
      if (! Reflect.hasMetadata('routes', target)) {
        Reflect.defineMetadata('routes', [], target);
      }
      if (! Reflect.hasMetadata('mw', target)) {
        Reflect.defineMetadata('mw', [], target);
      }

      if(middleware){
        Reflect.defineMetadata('mw', middleware, target);
      }

    };
  };

  // Decorator/Get.ts
/**
 * This is used to convert into get API
 * @param {string} path   default-"/"
 * @param {[(req: Request, res: Response, next: NextFunction) => void]} middleware
 * @returns 
 */
export function Get(path="/",middleware=[]) {
  // `target` equals our class, `propertyKey` equals our decorated method name
  return (target, propertyKey) => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (! Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor);

    routes.push({
      requestMethod: 'get',
      path,
      methodName: propertyKey,
      mw:middleware
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
    let aroutes = Reflect.getMetadata('routes', target.constructor);
    console.log("🚀 ~ file: test.js ~ line 49 ~ return ~ routes", aroutes)
  };
};

export function Put(path="/",middleware=[]) {
    // `target` equals our class, `propertyKey` equals our decorated method name
    return (target, propertyKey) => {
      // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
      // To prevent any further validation simply set it to an empty array here.
      if (! Reflect.hasMetadata('routes', target.constructor)) {
        Reflect.defineMetadata('routes', [], target.constructor);
      }
  
      // Get the routes stored so far, extend it by the new route and re-set the metadata.
      const routes = Reflect.getMetadata('routes', target.constructor);
  
      routes.push({
        requestMethod: 'put',
        path,
        methodName: propertyKey,
        mw:middleware
      });
      Reflect.defineMetadata('routes', routes, target.constructor);
    };
  };

  export function Post(path="/",middleware=[]) {
    // `target` equals our class, `propertyKey` equals our decorated method name
    return (target, propertyKey) => {
      // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
      // To prevent any further validation simply set it to an empty array here.
      if (! Reflect.hasMetadata('routes', target.constructor)) {
        Reflect.defineMetadata('routes', [], target.constructor);
      }
  
      // Get the routes stored so far, extend it by the new route and re-set the metadata.
      const routes = Reflect.getMetadata('routes', target.constructor);
  
      routes.push({
        requestMethod: 'post',
        path,
        methodName: propertyKey,
        mw:middleware
      });
      Reflect.defineMetadata('routes', routes, target.constructor);
      let aroutes = Reflect.getMetadata('routes', target.constructor);
      console.log("🚀 ~ file: test.js ~ line 49 ~ return ~ routes", aroutes)
    };
  };

  export function Delete(path="/",middleware=[]) {
    // `target` equals our class, `propertyKey` equals our decorated method name
    return (target, propertyKey) => {
      // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
      // To prevent any further validation simply set it to an empty array here.
      if (! Reflect.hasMetadata('routes', target.constructor)) {
        Reflect.defineMetadata('routes', [], target.constructor);
      }
  
      // Get the routes stored so far, extend it by the new route and re-set the metadata.
      const routes = Reflect.getMetadata('routes', target.constructor);
  
      routes.push({
        requestMethod: 'delete',
        path,
        methodName: propertyKey,
        mw:middleware
      });
      Reflect.defineMetadata('routes', routes, target.constructor);
      let aroutes = Reflect.getMetadata('routes', target.constructor);
      console.log("🚀 ~ file: test.js ~ line 49 ~ return ~ routes", aroutes)
    };
  };


  export function loadControllers(app,controllers=[]) {
      console.log("🚀 ~ file: controller.js ~ line 120 ~ loadControllers ~ controllers", controllers)
      console.log("🚀 ~ file: controller.js ~ line 120 ~ loadControllers ~ app",app)
    controllers.forEach(controller => {
    console.log("🚀 ~ file: controller.js ~ line 123 ~ loadControllers ~ controller", controller)
      const instance = new controller();
      const prefix = Reflect.getMetadata('prefix', controller);
      const routes = Reflect.getMetadata('routes', controller);
      console.log("🚀 ~ file: controller.js ~ line 127 ~ loadControllers ~ routes", routes)
      const mw = Reflect.getMetadata('mw', controller);
      if (mw.length)
        app.use(prefix, mw);
      routes.forEach(route => {
        if (route.mw.length)
          app[route.requestMethod](prefix + route.path, route.mw, (req, res,next) => {
             instance[route.methodName](req, res,next);
          });
        else
          app[route.requestMethod](prefix + route.path, (req, res,next) => {
             instance[route.methodName](req, res,next);
          });
      });
    });
  };