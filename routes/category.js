const express = require("express");
const router = express.Router();

// middlewares
const { requireSignin, isAdmin} = require('../controllers/user')

// controller
const {
  create,
  read,
  update,
  remove,
  list,
  getSubs,
} = require("../controllers/category");

// routes
router.post("/category", requireSignin, isAdmin, create);
router.get("/categories", list);
router.get("/category/:slug", read);
router.put("/category/:slug", requireSignin, isAdmin, update);
router.delete("/category/:slug", requireSignin, isAdmin, remove);
router.get("/category/subs/:_id", getSubs);

module.exports = router;
