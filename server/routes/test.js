const {API,Get}=require('../lib/core_controller');
@API('/avi')
export class MyClass {
    @Get()
     test(req, res, next) {
        res.send('avi default api ');
      }
    @Get('/api/:id')
     newmethod(req, res, next) {
        res.send('api with id ');
      }
}

