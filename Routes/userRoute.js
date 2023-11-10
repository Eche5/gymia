const express = require("express");

const usercontroller = require("../Controller/userController");
const messageController = require("../Controller/messageController");

const router = express.Router();

router.route("/register").post(usercontroller.createUser);
router.route("/auth").post(usercontroller.Login);
router.route("/message/:id").get(messageController.getMessages);

module.exports = router;
