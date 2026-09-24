import prisma from "../utils/prisma.js";
import { pusher } from "../utils/pusher.js";

export const getMentorConversations = async (trainerId) => {
  const trainer = await prisma.user.findUnique({ where: { id: trainerId } });
  if (!trainer) throw new Error("Trainer not found");

  const assignments = await prisma.mentorTrainerAssignment.findMany({
    where: { trainerId },
    include: {
      mentor: {
        include: {
          userProfileDetails: true,
        },
      },
    },
  });

  const conversations = await Promise.all(
    assignments.map(async (assignment) => {
      const mentor = assignment.mentor;
      const conversationId = `mentor_${mentor.id}_trainer_${trainerId}`;

      const lastMessage = await prisma.chatMessage.findFirst({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        select: { message: true, createdAt: true },
      });

      return {
        id: conversationId,
        mentorId: mentor.id,
        mentorName: `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim(),
        mentorAvatar: mentor.userProfileDetails?.[0]?.avatarUrl || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`,
        lastMessage: lastMessage?.message || "No messages yet",
        lastMessageTime: lastMessage?.createdAt?.toISOString() || mentor.createdAt.toISOString(),
        status: mentor.isActive ? "online" : "offline",
      };
    })
  );

  return {
    conversations: conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)),
    total: conversations.length,
  };
};

export const getMessagesFromMentor = async (trainerId, mentorId, page = 1, limit = 20) => {
  if (page < 1) page = 1;
  const skip = (page - 1) * limit;

  const trainer = await prisma.user.findUnique({ where: { id: trainerId } });
  if (!trainer) throw new Error("Trainer not found");

  const mentor = await prisma.user.findUnique({
    where: { id: mentorId },
    include: { userProfileDetails: true },
  });
  if (!mentor) throw new Error("Mentor not found");

  const assignment = await prisma.mentorTrainerAssignment.findFirst({
    where: { mentorId, trainerId },
  });
  if (!assignment) throw new Error("Mentor not assigned to you");

  const conversationId = `mentor_${mentorId}_trainer_${trainerId}`;

  const [messages, total] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { conversationId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.chatMessage.count({ where: { conversationId } }),
  ]);

  return {
    conversationId,
    mentorId,
    mentorName: `${mentor.firstName} ${mentor.lastName}`,
    mentorAvatar: mentor.userProfileDetails?.[0]?.avatarUrl,
    messages: messages.reverse(),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const sendMessageToMentor = async (trainerId, mentorId, message) => {
  const trainer = await prisma.user.findUnique({ where: { id: trainerId } });
  if (!trainer) throw new Error("Trainer not found");

  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const assignment = await prisma.mentorTrainerAssignment.findFirst({
    where: { mentorId, trainerId },
  });
  if (!assignment) throw new Error("Mentor not assigned to you");

  if (!message || message.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  const conversationId = `mentor_${mentorId}_trainer_${trainerId}`;

  let chatConversation = await prisma.chatConversation.findFirst({
    where: { conversationId },
  });

  if (!chatConversation) {
    chatConversation = await prisma.chatConversation.create({
      data: {
        conversationId,
        trainerId,
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
      senderId: trainerId,
      receiverId: mentorId,
      message,
      type: "TEXT",
      status: "SENT",
    },
  });

  // Send real-time notification to mentor via Pusher
  await pusher.trigger(
    `mentor-${mentorId}`,
    "new-message-from-trainer",
    {
      messageId: chatMessage.id,
      conversationId,
      senderId: chatMessage.senderId,
      senderType: "trainer",
      senderName: `${trainer.firstName} ${trainer.lastName}`,
      message: chatMessage.message,
      timestamp: chatMessage.createdAt.toISOString(),
      read: false,
    }
  );

  return {
    messageId: chatMessage.id,
    conversationId,
    senderId: chatMessage.senderId,
    senderType: "trainer",
    message: chatMessage.message,
    timestamp: chatMessage.createdAt.toISOString(),
  };
};
