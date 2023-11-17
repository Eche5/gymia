const express = require("express");

const usercontroller = require("../Controller/userController");
const messageController = require("../Controller/messageController");
const refreshToken = require("../utils/refreshToken");

const router = express.Router();

router.route("/register").post(usercontroller.createUser);
router.route("/auth").post(usercontroller.Login);
router.route("/googleAuth", usercontroller.googleAuth);
router.route("/logout", usercontroller.LogOut);
router
  .route("/:id")
  .patch(usercontroller.updateUserInfo)
  .get(usercontroller.getUser);
router.route("/message/:id").get(messageController.getMessages);
router.route("/").get(refreshToken.refreshTokenHandler);

module.exports = router;
