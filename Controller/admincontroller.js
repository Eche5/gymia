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

    let config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    };
    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Gymia",
        link: "https://mailgen.js/",
        copyright: "Copyright © 2023 Gymia. All rights reserved.",
      },
    });
    let response = {
      body: {
        name: newAdmin.firstname,
        intro:
          "We are thrilled to have you join us. Verify your email address to get started and access the resources available on our platform.",
        action: {
          instructions: "Click the button below to verify your account:",
          button: {
            color: "#22BC66", // Optional action button color
            text: "Verify your account",
            link: ` https://gymia.vercel.app/verify/${newAdmin._id}`,
          },
        },
        signature: "Sincerely",
      },
    };
    let mail = MailGenerator.generate(response);
    let message = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify email",
      html: mail,
    };
    transporter
      .sendMail(message)
      .then(() => {
        return res.status(200).json({
          message: "success",
        });
      })
      .catch(() => {
        return res.status(404).json({ message: "failed" });
      });
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
