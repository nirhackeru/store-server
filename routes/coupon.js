const express = require("express");
const router = express.Router();

// middlewares
const { requireSignin, isAdmin} = require('../controllers/user')


// controller
const { create, remove, list } = require("../controllers/coupon");

// routes
router.post("/coupon", requireSignin, isAdmin, create);
router.get("/coupons", list);
router.delete("/coupon/:couponId", requireSignin, isAdmin, remove);

module.exports = router;
