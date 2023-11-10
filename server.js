// const app = require("./app");
// const dotenv = require("dotenv");
// dotenv.config({ path: "./config.env" });
// const mongoose = require("mongoose");

// const DB = process.env.DATABASE;

// mongoose.connect(DB).then(() => {
//   console.log("DB is running");
// });
// const PORT = process.env.PORT;
// app.listen(PORT, () => {
//   console.log(`app is running on port ${PORT}`);
// });
// server.js

const { app, server } = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE;
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose
  .connect(DB)
  .then(() => {
    console.log("MongoDB connected");
    // Start the server after successful MongoDB connection
    startServer();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Start the server
function startServer() {
  const serverInstance = server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  serverInstance.on("error", (err) => {
    console.error("Server error:", err);
  });
}
