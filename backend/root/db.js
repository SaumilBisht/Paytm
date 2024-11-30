const mongoose=require("mongoose");

mongoose.connect("mongodb+srv://bishtsaumil:1gupbDqMS8dIYz63@cluster0.9p1qw.mongodb.net/paytm")

const userSchema=mongoose.Schema({
  username:String,
  password:String,
  firstName:String,
  lastName:String
  })

const User=mongoose.model("User",userSchema);

module.exports={User}