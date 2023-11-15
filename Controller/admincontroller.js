const Admin = require("../Model/adminModel");
const asyncHandler = require("express-async-handler");
const User = require("../Model/userModel");

exports.createAdmin = asyncHandler(async function(req, res) {
  const { email } = req.body;

  const user = await Admin.findOne({ email });

  if (user) {
    return res.status(403).json({ message: "email already exist" });
  } else {
    const newAdmin = await Admin.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
      phonenumber: req.body.phonenumber,
      confirmPassword: req.body.confirmPassword,
    });
    res.status(201).json({ status: "success", data: newAdmin });
  }
});

exports.getAllUsers = async function(req, res) {
  try {
    const users = await User.find();
    return res.status(200).json({ status: "success", data: users });
  } catch (error) {
    return res
      .status(200)
      .json({ status: "failed", message: "something went wrong" });
  }
};
exports.Login = async function(req, res) {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({
      message: "email does not belong to an existing user or is unauthorized",
    });
  } else {
    return res.status(200).json({ status: "success", data: admin });
  }
};
