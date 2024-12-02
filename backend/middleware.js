//This is just for verifying jwt token
const {JWT_SECRET}=require("./config")
const jwt=require("jsonwebtoken")

const authMiddleware=(req,res,next)=>{

  const authHeader=req.headers.authorization
  if(!authHeader || !authHeader.startsWith('Bearer '))
  {
    res.status(401).json({})
  }

  const token = authHeader.split(' ')[1];
  try{
    const decoded=jwt.verify(token,JWT_SECRET)
    
    if(decoded.userId){
      req.userId=decoded.userId 
      next(); 
    }
    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    
  }
  catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }  
}
module.exports={authMiddleware};
