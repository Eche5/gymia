const Admin = require("../Model/adminModel");
const User = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

exports.createUser = asyncHandler(async function(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    return res.status(403).json({ message: "email already exist" });
  } else {
    const newUser = await User.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
      phonenumber: req.body.phonenumber,
      confirmPassword: req.body.confirmPassword,
    });
    res.status(201).json({ status: "success", data: newUser });
  }
});

exports.Login = async function(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  const admin = await Admin.findOne({ email });

  if (!user && !admin) {
    return res.status(401).json({
      message: "Email does not belong to an existing user or is unauthorized",
    });
  }

  let match = false;
  if (user) {
    match = await user.comparePassword(password, user.password);
  }

  let matchadmin = false;
  if (admin) {
    matchadmin = await admin.comparePassword(password, admin.password);
  }

  if (!match && !matchadmin) {
    return res.status(401).json({
      message: "Email or password is incorrect",
    });
  } else {
    const accessToken = jwt.sign({ id: user.email }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign(
      { id: user.email },
      process.env.REFRESH_JWT_SECRET,
      {
        expiresIn: "30m",
      }
    );
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ data: user || admin, accessToken });
  }
};
