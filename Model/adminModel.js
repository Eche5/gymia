const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const adminSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Please provide a firstname"],
  },
  lastname: {
    type: String,
    required: [true, "Please provide a lastname"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    validate: [validator.isEmail, "Please provide a valid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function(val) {
        return this.password === val;
      },
      message: "Passwords do not match",
    },
  },
  role: {
    type: String,
    default: "Admin",
  },
  phonenumber: {
    type: String,
    required: [true, "Please provide your phone number"],
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});
adminSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  (this.confirmPassword = undefined), next();
});
adminSchema.methods.comparePassword = async function(
  currentPassword,
  userPassword
) {
  return await bcrypt.compare(currentPassword, userPassword);
};
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
