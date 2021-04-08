const express = require("express");
const router = express.Router();

// middlewares
const { requireSignin, isAdmin} = require('../controllers/user')

// controller
const { create, read, update, remove, list } = require("../controllers/sub");

// routes
router.post("/sub", requireSignin, isAdmin, create);
router.get("/subs", list);
router.get("/sub/:slug", read);
router.put("/sub/:slug", requireSignin, isAdmin, update);
router.delete("/sub/:slug", requireSignin, isAdmin, remove);

module.exports = router;
