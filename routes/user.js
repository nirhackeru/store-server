const express = require('express')
const router = express.Router()

const {userSignupValidator} = require('../validator')

const {signup,
    signin, 
    signout, 
    requireSignin, 
    userById, 
    isAdmin, 
    isAuth,
    auth, 
    userCart,
    getUserCart,
    emptyCart,
    saveAddress,
    applyCouponToUserCart,
    createOrder,
    orders,
    addToWishlist,
    wishlist,
    removeFromWishlist
} = require('../controllers/user')


router.post('/signup',userSignupValidator,signup)
router.post('/signin',signin)
router.get('/auth',requireSignin,auth)
router.get('/signout',signout)

router.post("/user/cart", requireSignin, userCart); // save cart
router.get("/user/cart", requireSignin, getUserCart); // get cart
router.delete("/user/cart", requireSignin, emptyCart); // empty cart
//user address
router.post("/user/address", requireSignin, saveAddress);
// coupon
router.post("/user/cart/coupon", requireSignin, applyCouponToUserCart);

//order
router.post("/user/order", requireSignin, createOrder);
router.get("/user/orders", requireSignin, orders);

// wishlist
router.post("/user/wishlist", requireSignin, addToWishlist);
router.get("/user/wishlist", requireSignin, wishlist);
router.put("/user/wishlist/:productId", requireSignin, removeFromWishlist);


//testing
// router.get("/hello",requireSignin, (req,res) => {
//     res.send("hello..")
// })

// router.get("/secret/:userId", requireSignin,isAuth, (req,res) =>{
//     res.json({
//         user: req.profile
//     })
// })

router.param("userId", userById)


module.exports = router;

