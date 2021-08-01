export const validateBodyMiddleware=(req,res,next)=>{
    console.log("Req body",req.body);
    next()
}