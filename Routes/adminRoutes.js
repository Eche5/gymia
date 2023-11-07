const express = require("express");
const admincontroller = require("../Controller/admincontroller");
const router = express.Router();

router.route("/register").post(admincontroller.createAdmin);
router.route("/users").get(admincontroller.getAllUsers);
// router.route("/auth").post(admincontroller.Login);

module.exports = router;
