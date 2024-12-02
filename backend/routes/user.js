const express=require("express")
const zod=require("zod")
const jwt=require("jsonwebtoken")
const router=express.Router()
const {User, Account}=require("../root/db")
const {JWT_SECRET}=require("../config")
const {authMiddleware} = require("../middleware")


const signupCheck=zod.object({
  firstName: zod.string(),
  lastName:zod.string(),
  username:zod.string(),
  password:zod.string()
})//valid email

router.post('/signup',async (req,res)=>{
  const { success } = signupCheck.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })
    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })

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

router.put("/user",authMiddleware,async (req,res)=>{
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

router.get('/bulk',async(req,res)=>{
  const filter=req.query.filter || "";

  const users=await User.find({
    $or: [{
      firstName:{
        $regex:filter
      }
    },{
      lastName:{
        $regex:filter
      }
    }
    ]
  })

  res.json({
    user: users.map((user)=>({
      username:user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id
    }))
  })
})
 
module.exports=router