const express = require("express");
const router = express.Router();

// middlewares
const { requireSignin, isAdmin} = require('../controllers/user')

// controller
const {
    create,
    listAll,
    remove,
    read,
    update,
    list,
    productsCount,
    productStar,
    listRelated,
    searchFilters
  } = require("../controllers/product");

// routes
router.post("/product", requireSignin, isAdmin, create);
router.get("/products/total", productsCount);

router.get("/products/:count", listAll); // products/100
router.delete("/product/:slug", requireSignin, isAdmin, remove);
router.get("/product/:slug", read);
router.put("/product/:slug", requireSignin, isAdmin, update);

router.post("/products", list);
// rating
router.put("/product/star/:productId", requireSignin, productStar);
// related
router.get("/product/related/:productId", listRelated);
// search
router.post("/search/filters", searchFilters);

module.exports = router;
