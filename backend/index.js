const express = require("express");
const app=express()
const cors=require("cors")

const mainRouter=require("./routes/index")

app.use(cors()) //frontend backend on different ports
app.use(express.json()) //body parser

app.use('/api/v1',mainRouter);//saari requests is route ke through cuz app.use mei h
// All API routes start with /api/v1
//Any routes defined in mainRouter will be accessed via /api/v1/....
app.listen(3000);