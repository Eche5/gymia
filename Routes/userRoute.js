const express = require("express");
const usercontroller = require("../Controller/userController");
const router = express.Router();

router.route("/register").post(usercontroller.createUser);
router.route("/auth").post(usercontroller.Login);

module.exports = router;
