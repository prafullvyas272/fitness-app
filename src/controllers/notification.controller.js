import prisma from "../utils/prisma.js";

export const createTestNotificationHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title = "Test Notification", message = "This is a test notification", type = "REMINDER" } = req.body;

    const notification = await prisma.notification.create({
      data: { userId, title, message, type },
    });

    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotificationsHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, pageSize = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const [total, unreadCount, notifications] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(pageSize),
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({
      success: true,
      unreadCount,
      data: notifications,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markNotificationReadHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    if (notification.userId !== userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAllNotificationsReadHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
