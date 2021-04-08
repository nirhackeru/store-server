const express = require('express')
const app = express()
require('dotenv').config()
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressValidator = require('express-validator')
const cors = require("cors");


const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const subRoutes = require('./routes/sub')
const productRoutes = require('./routes/product')
const cloudinaryRoutes = require('./routes/cloudinary')
const couponRoutes = require('./routes/coupon')
const adminRoutes = require('./routes/admin')



//middlewares
app.use(morgan("dev"))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
  })
);app.use(cookieParser())
app.use(expressValidator())
app.use(cors())

//routes
app.use("/api",userRoutes)
app.use('/api',categoryRoutes)
app.use('/api',subRoutes)
app.use('/api',productRoutes)
app.use('/api',cloudinaryRoutes)
app.use('/api',couponRoutes)
app.use('/api',adminRoutes)

mongoose.connect(process.env.DATABASE,{useNewUrlParser:true, useCreateIndex:true,useFindAndModify:false, useUnifiedTopology:true}).then(() => console.log('DB CONNECTED')).catch((err) => console.log("DB CONNECTED ERROR", err))


const port = process.env.PORT || 8000

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})
