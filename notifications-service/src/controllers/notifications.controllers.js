const prisma = require("../services/prisma");

// GET /notifications
exports.getNotifications = async (req, res) => {
  const userId = req.headers["x-user-id"];

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  res.json(notifications);
};

// PATCH /notifications/:id/read
exports.markAsRead = async (req, res) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true }
  });

  res.sendStatus(204);
};

// POST /internal/notify
exports.internalNotify = async (req, res) => {
  const notification = await prisma.notification.create({
    data: req.body
  });

  res.status(201).json(notification);
};
