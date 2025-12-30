const prisma = require("../services/prisma");
const axios = require("axios");

// GET /conversations
exports.getConversations = async (req, res) => {
  const userId = req.headers["x-user-id"];

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId }
      }
    },
    include: {
      participants: true
    },
    orderBy: {
      lastMessageAt: "desc"
    }
  });

  res.json(conversations);
};

// GET /conversations/:id/messages
exports.getMessages = async (req, res) => {
  const { id } = req.params;

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" }
  });

  res.json(messages);
};

// POST /conversations/:id/messages
exports.sendMessage = async (req, res) => {
  const { id } = req.params;
  const { text, toUser } = req.body;
  const fromUser = req.headers["x-user-id"];

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      fromUser,
      toUser,
      text
    }
  });

  await prisma.conversation.update({
    where: { id },
    data: { lastMessageAt: new Date() }
  });

  // Notificação
  await axios.post("http://notifications-service:3005/internal/notify", {
    userId: toUser,
    type: "NEW_MESSAGE",
    message: "Tens uma nova mensagem"
  });

  res.status(201).json(message);
};

