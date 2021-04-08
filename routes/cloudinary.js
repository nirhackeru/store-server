const express = require("express");
const router = express.Router();

const { requireSignin, isAdmin} = require('../controllers/user')

// controllers
const { upload, remove } = require("../controllers/cloudinary");

router.post("/uploadimages", requireSignin, isAdmin, upload);
router.post("/removeimage", requireSignin, isAdmin, remove);

module.exports = router;
