import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
  // Remove Number() conversion if req.userId is already a string.
  const tokenUserId = req.userId;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    for (const chat of chats) {
      const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

      const receiver = await prisma.user.findUnique({
        where: {
          id: receiverId,
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });
      chat.receiver = receiver;
    }

    res.status(200).json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

export const getChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found!" });
    }

    // Update seenBy after confirming that the chat exists.
    await prisma.chat.update({
      where: { id: req.params.id },
      data: {
        seenBy: {
          push: tokenUserId,
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  const receiverId = req.body.receiverId;

  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID is required" });
  }

  try {
    // Create the chat with a nested blank message
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, receiverId],
        messages: {
          create: {
            text: "", // Blank message
            userId: tokenUserId, // Sender is the logged-in user
          },
        },
      },
      include: {
        messages: true, // Return messages so the new chat includes the blank message
      },
    });

    // Query the receiver's information and attach it so that the client gets receiver details.
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, username: true, avatar: true },
    });
    newChat.receiver = receiver;

    res.status(200).json(newChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add chat!" });
  }
};

export const deleteChat = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: req.params.id },
    });
    if (!chat || !chat.userIDs.includes(tokenUserId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await prisma.message.findMany({
      where: { chatId: req.params.id },
    });

    if (messages.length === 0) {
      await prisma.chat.delete({
        where: { id: req.params.id },
      });
      return res.status(200).json({ message: "Blank chat deleted" });
    } else {
      return res.status(400).json({ message: "Chat not empty" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete chat" });
  }
};

export const readChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chatExists = await prisma.chat.findFirst({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    if (!chatExists) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const chat = await prisma.chat.update({
      where: { id: req.params.id },
      data: {
        seenBy: {
          set: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark chat as read!" });
  }
};
