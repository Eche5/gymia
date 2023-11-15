const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");

exports.refreshTokenHandler = async function(req, res) {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(400).json({ message: "unauthorized" });
  const refreshToken = cookies.jwt;
  jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, async function(
    err,
    decoded
  ) {
    if (err) return res.status(401).json({ message: "Forbidden" });
    const user = await User.findOne({ email: decoded.id });
    if (!user) return res.status(401).json({ message: "Unauthorizeds" });

    const accessToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );
    return res.status(200).json({ accessToken, data: user });
  });
};
