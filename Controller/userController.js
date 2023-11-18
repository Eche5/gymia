const Admin = require("../Model/adminModel");
const User = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const asyncHandler = require("express-async-handler");

exports.createUser = asyncHandler(async function(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email });
  try {
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
          name: newUser.firstname,
          intro:
            "We are thrilled to have you join us. Verify your email address to get started and access the resources available on our platform.",
          action: {
            instructions: "Click the button below to verify your account:",
            button: {
              color: "#22BC66", // Optional action button color
              text: "Verify your account",
              link: ` https://gymia.vercel.app/verify/${newUser._id}`,
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
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
});

function generateAndSetTokens(res, id, accessTokenSecret, refreshTokenSecret) {
  const accessToken = jwt.sign({ id }, accessTokenSecret, {
    expiresIn: "10m",
  });
  const refreshToken = jwt.sign({ id }, refreshTokenSecret, {
    expiresIn: "30m",
  });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return accessToken;
}

//resend verification
exports.resendverification = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

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
      name: user.firstname,
      intro:
        "We are thrilled to have you join us. Verify your email address to get started and access the resources available on our platform.,",
      action: {
        instructions: "Click the button below to verify your account.:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your account",
          link: ` https://gymia.vercel.app/verify/${user._id}`,
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
};

//email verification
exports.verify = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(403)
        .json({ message: "email does not belong to an existing user" });
    } else if (user.isVerified) {
      return res
        .status(401)
        .json({ status: "error", message: "user already verified" });
    } else {
      const user = await User.findByIdAndUpdate(id, { isVerified: true });

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
      return res.status(200).json({ data: user, accessToken });
    }
  } catch (error) {
    return res.status(404).json({
      status: "failed",
      message: "Verification failed",
    });
  }
};

exports.Login = async function(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  const admin = await Admin.findOne({ email });
  const match = await user?.comparePassword(password, user.password);

  const matchadmin = await admin?.comparePassword(password, admin.password);

  if (!user && !admin) {
    return res.status(401).json({
      message: "Email does not belong to an existing user or is unauthorized",
    });
  } else if (match && !user.isVerified) {
    return res.status(401).json({
      status: "failed",
      message: "please verify your email",
    });
  } else if (!match && !user.isVerified) {
    return res
      .status(400)
      .json({ status: "failed", message: "email or password does not match" });
  }

  if ((user && match) || (admin && matchadmin)) {
    const accessToken = generateAndSetTokens(
      res,
      user?.email || admin?.email,
      process.env.JWT_SECRET,
      process.env.REFRESH_JWT_SECRET
    );
    return res.status(200).json({ data: user || admin, accessToken });
  } else {
    return res.status(401).json({
      message: "Email or Password is incorrect",
    });
  }
};

exports.updateUserInfo = async function(req, res) {
  const id = req.params.id;
  const updatedUser = await User.findByIdAndUpdate(id, {
    weight: req.body.weight,
    height: req.body.height,
    address: req.body.address,
    medicalCondition: req.body.medicalCondition,
    gender: req.body.gender,
    DOB: req.body.DOB,
  });
  return res.status(200).json({ updatedUser });
};
exports.googleAuth = async (req, res) => {
  const email = req.query.email;
  const accessToken = req.query.token;
  const user = await User.findOne({ email });
  const admin = await Admin.findOne({ email });
  if ((user && user?.isVerified) || (admin && admin?.isVerified)) {
    const refreshToken = jwt.sign(
      { id: user.email || admin.email },
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
    return res.status(200).json({ data: user || admin, accessToken });
  } else if (!user?.isVerified || !admin?.isVerified) {
    return res.status(401).json({
      status: "failed",
      message: "please verify your email",
    });
  } else {
    return res
      .status(403)
      .json({ message: "email does not belong to an existing user" });
  }
};
exports.getUser = async function(req, res) {
  const id = req.params.id;
  const user = await User.findById(id);
  return res.status(200).json({ user });
};
exports.LogOut = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "None" });
  return res.json({ message: "cookie cleared" });
};

//forgot password
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .json({ status: "error", message: "user does not exist" });
  } else {
    const reset = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

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
        name: user.firstname,
        intro: "You recently requested that the password be reset,",
        action: {
          instructions: "To reset your password please click this button:",
          button: {
            color: "#22BC66", // Optional action button color
            text: "Reset your password",
            link: `https://gymia.vercel.app/resetpassword/${user._id}/${reset}`,
          },
        },
        signature: "Sincerely",
        outro:
          "If this is a mistake just ignore this email - your password will not be changed.",
      },
    };
    let mail = MailGenerator.generate(response);
    let message = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
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
};

//reset password
exports.resetPassword = async (req, res, next) => {
  const id = req.params.id;
  const providedToken = req.params.token;
  const hashOfProvidedToken = crypto
    .createHash("sha256")
    .update(providedToken)
    .digest("hex");

  try {
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "User does not exist" });
    }

    const match = await user.comparePassword(req.body.password, user.password);
    const tokenIsValid = hashOfProvidedToken === user.passwordResetToken;
    const tokenIsExpired = user.passwordResetTokenExpires < Date.now();

    if (match) {
      return res.status(400).json({
        status: "error",
        message: "Password cannot be the same as your previous password",
      });
    }

    if (tokenIsValid && !tokenIsExpired) {
      const newpassword = await user.encryptpassword(
        req.body.password,
        req.body.confirmPassword
      );

      await User.findByIdAndUpdate(
        user._id,
        {
          password: newpassword,
          confirmPassword: undefined,
        },
        { validateBeforeSave: false }
      );

      let config = {
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      };

      const currentTimestamp = Date.now();
      const date = new Date(currentTimestamp);

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short",
      };

      const formattedDate = date.toLocaleString("en-US", options);
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
          name: user.firstname,
          intro: "You have successfully changed your password",
          dictionary: { date: formattedDate },
          signature: "Sincerely",
          outro: "Didn't do this? Be sure to change your password right away.",
        },
      };

      let mail = MailGenerator.generate(response);
      let message = {
        from: process.env.EMAIL,
        to: user.email,
        subject: `${user.firstname}, your password was successfully reset`,
        html: mail,
      };

      transporter.sendMail(message, (error) => {
        if (error) {
          console.error(error);
          return res.status(404).json({ message: "failed" });
        } else {
          return res.status(200).json({ status: "success" });
        }
      });
    } else {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};
