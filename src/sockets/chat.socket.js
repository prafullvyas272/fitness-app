import { sendMessage } from "../services/chat.service.js";
import { sendChatNotification } from "../services/notification.service.js";

const onlineUsers = new Map();

export const initChatSocket = (io) => {

  io.on("connection", (socket) => {

    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on("sendMessage", async (data) => {

      const message = await sendMessage(data);

      io.to(data.conversationId).emit("receiveMessage", message);

      if (!onlineUsers.has(data.receiverId)) {
        await sendChatNotification(data.receiverId, data.message);
      }

    });

    socket.on("typing", (data) => {
      socket.to(data.conversationId).emit("typing", data);
    });

    socket.on("stopTyping", (data) => {
      socket.to(data.conversationId).emit("stopTyping", data);
    });

    socket.on("disconnect", () => {

      for (const [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          onlineUsers.delete(key);
        }
      }

    });

  });

};