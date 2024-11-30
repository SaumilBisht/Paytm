const express=require("express")
const zod=require("zod")
const jwt=require("jsonwebtoken")
const router=express.Router()
const {User}=require("../root/db")
const {JWT_SECRET}=require("../config")
const { authMiddleware } = require("../middleware")


const signupCheck=zod.object({
  firstName: zod.string(),
  lastName:zod.string(),
  username:zod.string(),
  password:zod.string()
})//valid email

router.post('/signup',async (req,res)=>{
  const body=req.body;

  const {success}=signupCheck.safeParse(body)//success ko {} cuz object return krta h wrna success.success krna pdta

  if(!success){
    return res.status(400).json({
      message: "Invalid Inputs"
    })
  }

  const user=await User.findOne({
    username:body.username
  })//db mein ek hi username iska

  if(user)//if user exists
  {
    return res.status(411).json({
      message: "Email is already taken"
    })
  }

  const dbUser=await User.create(body);

  const token=jwt.sign({
    userId:dbUser._id
  },JWT_SECRET)
//token ham userId,Secret se bna rhe
  res.json({
    message:"User created successfully",
    token
  }) //token return 

})
 
router.post('/signin',async(req,res)=>{
  const body=req.body
  const signinCheck=zod.object({
    username:zod.string(),
    password:zod.string()
  })

  const {success}=signinCheck.safeParse(body)
  if(!success){
    return res.status(411).json({
      message: "Invalid Inputs"
    })
  }
  const user=await User.findOne({
    username:body.username
  })
  if(!user){
    res.status(411).json({
      message:"Invalid credentials"
    })
  }
  const token=jwt.sign({
    userId:user.username
  },JWT_SECRET)

  res.json({
    message:"Here is your token",
    token
  })
})


const updateBody=zod.object({
  firstName:zod.string().optional(),
  lastName:zod.string().optional(),
  password:zod.string().optional()
})

router.put('/user',authMiddleware,async (req,res)=>{
  const {success}=updateBody.safeParse(req.body)
  if(!success)
  {
    return res.status(411).json({
      message:"Invalid inputs"
    })
  }

  const result=await User.updateOne({
    _id: req.userId
  },req.body)//auth middleware ne userId kr diya tha username ko
  if (result.modifiedCount === 0) {
    return res.status(400).json({
      message: "Update failed. No changes were made.",
    });
  } //agr kuch update ni hua
  res.json({
    message:"Updated successfully "
  })
})
 
module.exports=router