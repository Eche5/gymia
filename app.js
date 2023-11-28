const express = require("express");
const cors = require("cors");
const credentials = require("./middlewares/credentials");
const socketIo = require("socket.io");
const http = require("http");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const adminrouter = require("./Routes/adminRoutes");
const userRouter = require("./Routes/userRoute");

const Message = require("./Model/messageModel"); // Assuming you have a Message model

const app = express();
app.use(cookieParser());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions,
});

// Middleware
app.use(credentials);
app.use(express.json());
app.use(cors(corsOptions));
// Routes
app.use("/admin", adminrouter);
app.use("/users", userRouter);

// Socket.IO event handling

io.on("connection", (socket) => {
  console.log("User connected");

  // Handle incoming messages
  socket.on("message", async (data) => {
    // const user = await User.findById(id);
    const id = data.userId;

    try {
      const newMessage = new Message({
        user: data.userId,
        text: data.text,
        timestamp: new Date(),
      });

      const savedMessage = await newMessage.save();

      // Broadcast the message to all connected clients
      io.emit("message", savedMessage);
    } catch (error) {
      console.error("Error saving message to MongoDB:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

module.exports = { app, server };
