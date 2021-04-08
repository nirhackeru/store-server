const express = require("express");

const router = express.Router();

// middlewares
const { requireSignin, isAdmin} = require('../controllers/user')

const { orders, orderStatus } = require("../controllers/admin");

// routes
router.get("/admin/orders", requireSignin, isAdmin, orders);
router.put("/admin/order-status", requireSignin, isAdmin, orderStatus);

module.exports = router;
