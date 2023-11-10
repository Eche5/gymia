const Message = require("../Model/messageModel");

exports.getMessages = async function(req, res) {
  const id = req.params.id;
  const messages = await Message.find({ user: id });

  if (!messages) {
    res.status(200).json({ status: "success", message: "empty " });
  } else {
    res.status(200).json({ status: "success", data: messages });
  }
};
