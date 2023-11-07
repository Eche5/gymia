const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const DB = process.env.DATABASE;

mongoose.connect(DB).then(() => {
  console.log("DB is running");
});
const PORT = 7000;
app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
});
