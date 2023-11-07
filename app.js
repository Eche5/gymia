const express = require("express");
const cors = require("cors");
const credentials = require("./middlewares/credentials");

const corsOptions = require("./config/corsOptions");
const adminrouter = require("./Routes/adminRoutes");
const userRouter = require("./Routes/userRoute");

const app = express();
app.use(credentials);
app.use(express.json());
app.use(cors(corsOptions));

app.use("/admin", adminrouter);

app.use("/users", userRouter);

module.exports = app;
