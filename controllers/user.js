const User = require("../models/user")
const Product = require("../models/product");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Order = require("../models/order");


const jwt = require("jsonwebtoken")
const expressJwt = require('express-jwt')
const {errorHandler} = require('../helpers/dbErrorHandle')

exports.signup = (req,res) => {
    const user = new User(req.body);
    user.save((err,user) =>{
        if (err){
            return res.status(400).json({err: errorHandler(err)})
        }
        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET)
        res.cookie("t",token, {expire: new Date() + 9999})
        const { _id, name, email, role} = user;
        return res.json({token, user: {_id, email,name, role}})
    })
}

exports.signin = (req,res) => {
    const {email, password} = req.body
    
    User.findOne({email}, (err,user) => {
        if (err || !user){
            return res.status(400).json({
                err: "User with that email does not exists."
            })
        }
        if (!user.authenticate(password)){
            return res.status(401).json({err: "Email and password don't match"})
        }

        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET)
        res.cookie("t",token, {expire: new Date() + 9999})
        const { _id, name, email, role} = user;
        return res.json({token, user: {_id, email,name, role}})
    })
}


exports.signout = (req,res) => {
    res.clearCookie("t")
    res.json({message: "Signout success"})
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms:["HS256"],
    userProperty:"auth"
})

exports.auth = (req,res) => {
    console.log('id:',req.auth._id)
    let _id = req.auth._id
    User.findById({ _id }).exec((err, user) => {
        if (err) throw new Error(err);
        const {name, email, role,  _id} = user
        res.json({name, email, role,  _id});
      });
}


exports.userById  = (req,res,next,id) =>{
    User.findById(id).exec((err,user) => {
        if (err || !user){
            return res.status(400).json({
                err: "User not found"
            })
        }
        req.profile = user
        next()
    })
}

exports.isAuth = (req,res,next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id
    if (!user){
        return res.status(403).json({
            err: "Access denied"
        })
    }
    next()
}

exports.isAdmin = async (req,res,next) => {
    console.log(req.auth)
    const user = await User.findById({_id: req.auth._id})
    console.log(user)
    if (user.role === 0){
        return res.status(403).json({
            err:"Admin resourse! Access denied"
        })
    }
    next()
}



//cart
exports.userCart = async (req, res) => {
    console.log(req.auth); // {cart: []}
    const { cart } = req.body;
  
    let products = [];
  
    const user = await User.findById(req.auth._id).exec();
  
    // check if cart with logged in user id already exist
    let cartExistByThisUser = await Cart.findOne({ orderdBy: user._id }).exec();
  
    if (cartExistByThisUser) {
      cartExistByThisUser.remove();
      console.log("removed old cart");
    }
  
    for (let i = 0; i < cart.length; i++) {
      let object = {};
  
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      // get price for creating total
      let productFromDb = await Product.findById(cart[i]._id)
        .select("price")
        .exec();
      object.price = productFromDb.price;
  
      products.push(object);
    }
  
    // console.log('products', products)
  
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
  
    // console.log("cartTotal", cartTotal);
  
    let newCart = await new Cart({
      products,
      cartTotal,
      orderdBy: user._id,
    }).save();
  
    console.log("new cart ----> ", newCart);
    res.json({ ok: true });
  };
  
  exports.getUserCart = async (req, res) => {
    const user = await User.findById(req.auth._id).exec();
  
    let cart = await Cart.findOne({ orderdBy: user._id })
      .populate("products.product", "_id title price totalAfterDiscount")
      .exec();
  
    const { products, cartTotal, totalAfterDiscount } = cart;
    res.json({ products, cartTotal, totalAfterDiscount });
  };
  
  exports.emptyCart = async (req, res) => {
    console.log("empty cart");
    const user = await User.findById(req.auth._id).exec();
  
    const cart = await Cart.findOneAndRemove({ orderdBy: user._id }).exec();
    res.json(cart);
  };
  
  exports.saveAddress = async (req, res) => {
    const userAddress = await User.findOneAndUpdate(
      { _id: req.auth._id },
      { address: req.body.address }
    ).exec();
  
    res.json({ ok: true });
  };

  exports.applyCouponToUserCart = async (req, res) => {
    const { coupon } = req.body;
    console.log("COUPON", coupon);
  
    const validCoupon = await Coupon.findOne({ name: coupon }).exec();
    if (validCoupon === null) {
      return res.json({
        err: "Invalid coupon",
      });
    }
    console.log("VALID COUPON", validCoupon);
  
    const user = await User.findById( req.auth._id).exec();
  
    let { products, cartTotal } = await Cart.findOne({ orderdBy: user._id })
      .populate("products.product", "_id title price")
      .exec();
  
    console.log("cartTotal", cartTotal, "discount%", validCoupon.discount);
  
    // calculate the total after discount
    let totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discount) / 100
    ).toFixed(2); // 99.99
  
    Cart.findOneAndUpdate(
      { orderdBy: user._id },
      { totalAfterDiscount },
      { new: true }
    );
  
    res.json(totalAfterDiscount);
  };

  exports.createOrder = async (req, res) => {
    console.log(req.body);
    let paymentIntent = req.body;
    // const  {paypalResponse, total} 
    
    const user = await User.findById(req.auth._id).exec();
  
    let { products } = await Cart.findOne({ orderdBy: user._id }).exec();
  
    let newOrder = await new Order({
      products,
      paymentIntent,
      orderdBy: user._id,
    }).save();
  
    // decrement quantity, increment sold
    let bulkOption = products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id }, // IMPORTANT item.product
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
  
    let updated = await Product.bulkWrite(bulkOption, {});
    console.log("PRODUCT QUANTITY-- AND SOLD++", updated);
  
    console.log("NEW ORDER SAVED", newOrder);
    res.json({ ok: true });
  };
  
  exports.orders = async (req, res) => {
    /*
    let user = await User.findById( req.auth._id ).exec();
    */

    let userOrders = await Order.find({ orderdBy:req.auth._id })
      .populate("products.product")
      .exec();
  
    res.json(userOrders);
  };
  
  exports.addToWishlist = async (req, res) => {
    const { productId } = req.body;
  
    const user = await User.findByIdAndUpdate(
      { _id: req.auth._id },
      { $addToSet: { wishlist: productId } }
    ).exec();
  
    res.json({ ok: true });
  };
  
  exports.wishlist = async (req, res) => {
    const list = await User.findById(req.auth._id)
      .select("wishlist")
      .populate("wishlist")
      .exec();
  
    res.json(list);
  };
  
  exports.removeFromWishlist = async (req, res) => {
    const { productId } = req.params;
    const user = await User.findByIdAndUpdate(
      { _id: req.auth._id },
      { $pull: { wishlist: productId } }
    ).exec();
  
    res.json({ ok: true });
  };
  
  

