import prisma from "../utils/prisma.js";

export const getConversationList = async (mentorId) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const assignments = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    include: {
      trainer: {
        include: {
          userProfileDetails: true,
        },
      },
    },
  });

  const conversations = assignments.map(assignment => {
    const trainer = assignment.trainer;
    const conversationId = `mentor_${mentorId}_trainer_${trainer.id}`;

    return {
      id: conversationId,
      ptId: trainer.id,
      ptName: `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim(),
      ptAvatar: trainer.userProfileDetails?.[0]?.avatarUrl || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`,
      lastMessage: "No messages yet",
      lastMessageTime: trainer.createdAt.toISOString(),
      unreadCount: 0,
      status: trainer.isActive ? "online" : "offline",
    };
  });

  return {
    conversations,
    total: conversations.length,
  };
};

export const getConversationMessages = async (mentorId, conversationId, page = 1, limit = 20) => {
  if (page < 1) page = 1;
  const skip = (page - 1) * limit;

  // Parse conversationId: mentor_{mentorId}_trainer_{trainerId}
  const match = conversationId.match(/mentor_(.+)_trainer_(.+)/);
  if (!match || match[1] !== mentorId) {
    throw new Error("Invalid conversation or unauthorized access");
  }

  const trainerId = match[2];

  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
    include: { userProfileDetails: true },
  });
  if (!trainer) throw new Error("Trainer not found");

  const assignment = await prisma.mentorTrainerAssignment.findFirst({
    where: { mentorId, trainerId },
  });
  if (!assignment) throw new Error("Trainer not assigned to this mentor");

  const chatConversation = await prisma.chatConversation.findFirst({
    where: {
      conversationId,
    },
  });

  const messages = chatConversation
    ? await prisma.chatMessage.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true } },
          receiver: { select: { id: true, firstName: true, lastName: true } },
        },
      })
    : [];

  const total = chatConversation ? await prisma.chatMessage.count({ where: { conversationId } }) : 0;

  const formattedMessages = messages.map(msg => ({
    id: msg.id,
    senderId: msg.senderId,
    senderName: `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim(),
    senderType: msg.senderId === mentorId ? "mentor" : "pt",
    message: msg.message,
    timestamp: msg.createdAt.toISOString(),
    read: msg.status === "READ" || msg.status === "DELIVERED",
  }));

  return {
    conversationId,
    ptId: trainer.id,
    ptName: `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim(),
    ptAvatar: trainer.userProfileDetails?.[0]?.avatarUrl || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`,
    messages: formattedMessages,
    pagination: {
      page,
      limit,
      total,
    },
  };
};

export const sendMessage = async (mentorId, conversationId, ptId, message) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const trainer = await prisma.user.findUnique({ where: { id: ptId } });
  if (!trainer) throw new Error("Trainer not found");

  const assignment = await prisma.mentorTrainerAssignment.findFirst({
    where: { mentorId, trainerId: ptId },
  });
  if (!assignment) throw new Error("Trainer not assigned to this mentor");

  if (!message || message.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  let chatConversation = await prisma.chatConversation.findFirst({
    where: { conversationId },
  });

  if (!chatConversation) {
    chatConversation = await prisma.chatConversation.create({
      data: {
        conversationId,
        trainerId: ptId,
        customerId: mentorId,
        lastMessage: message,
        lastMessageTime: new Date(),
      },
    });
  } else {
    await prisma.chatConversation.update({
      where: { id: chatConversation.id },
      data: {
        lastMessage: message,
        lastMessageTime: new Date(),
      },
    });
  }

  const chatMessage = await prisma.chatMessage.create({
    data: {
      conversationId,
      senderId: mentorId,
      receiverId: ptId,
      message,
      type: "TEXT",
      status: "SENT",
    },
  });

  return {
    messageId: chatMessage.id,
    conversationId,
    senderId: chatMessage.senderId,
    senderType: "mentor",
    message: chatMessage.message,
    timestamp: chatMessage.createdAt.toISOString(),
    read: true,
  };
};

export const markMessagesAsRead = async (mentorId, conversationId, messageIds) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const chatConversation = await prisma.chatConversation.findFirst({
    where: { conversationId },
  });
  if (!chatConversation) throw new Error("Conversation not found");

  await prisma.chatMessage.updateMany({
    where: {
      id: { in: messageIds },
      conversationId,
    },
    data: { status: "READ" },
  });

  return { success: true };
};

export const getUnreadCount = async (mentorId) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const assignments = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true },
  });

  const trainerIds = assignments.map(a => a.trainerId);

  const unreadMessages = await prisma.chatMessage.groupBy({
    by: ["conversationId"],
    where: {
      receiverId: mentorId,
      status: { not: "READ" },
    },
    _count: {
      id: true,
    },
  });

  const conversations = {};
  let totalUnread = 0;

  unreadMessages.forEach(item => {
    conversations[item.conversationId] = item._count.id;
    totalUnread += item._count.id;
  });

  return {
    totalUnread,
    conversations,
  };
};
