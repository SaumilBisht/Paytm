const express=require("express")
const authMiddleware = require("../middleware")
const { Account } = require("../root/db")
const mongoose = require("mongoose");

const router=express.Router()

router.get("/balance",authMiddleware, async(req,res)=>{
  const user=await Account.findOne({
    userId:req.userId
  })
  res.json({
    balance:user.balance
  })
})

router.post("/transfer",authMiddleware,async(req,res)=>{
  
  const session=await mongoose.startSession();

  session.startTransaction();

  try 
  {
    const { amount, to } = req.body;

    // Fetch sender's account
    const account = await Account.findOne({ userId: req.userId }).session(session);
    if (!account || account.balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Fetch recipient's account
    const toAccount = await Account.findOne({ userId: to }).session(session);
    if (!toAccount) {
      throw new Error("Recipient account not found");
    }

    // Perform the transaction
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    res.json({ message: "Transaction successful" });
  } catch (err) {
    await session.abortTransaction(); // Rollback changes
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession(); // Always end the session
  }
});

module.exports=router