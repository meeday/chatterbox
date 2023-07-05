const { AuthenticationError } = require("apollo-server-express");
const { User, Chat, Message } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parents, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );

        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
    searchUser: async (parent, { username }, context) => {
      if (context.user) {
        const user = await User.find({
          username: { $regex: username, $options: "i" },
        }).select("username avatar _id email bio");

        return user;
      }
      throw new AuthenticationError("Not logged in");
    },
    getChat: async (parent, { userId }, context) => {
      if (context.user) {
        let chat = await Chat.find({
          isGroupChat: false,
          $and: [{ users: { $elemMatch: { $eq: userId } } }],
        })
          .populate("users", "-password")
          .populate("latestMessage");

        chat = await User.populate(chat, {
          path: "latestMessage.sender",
          select: "username avatar email _id",
        });

        if (chat.length > 0) {
          return chat[0];
        } else {
          const createChat = await Chat.create({
            chatName: "sender",
            isGroupChat: false,
            users: [context.user._id, userId],
          });

          const fullChat = await Chat.findOne({ _id: createChat._id }).populate(
            "users",
            "-password"
          );
          return fullChat;
        }
      }
      throw new AuthenticationError("Not logged in");
    },
    getAllChats: async (parent, args, context) => {
      if (context.user) {
        const chat = await Chat.find({
          users: { $elemMatch: { $eq: context.user._id } },
        })
          .populate("users", "-password")
          .populate("groupAdmin", "-password")
          .populate("latestMessage")
          .sort({ updatedAt: -1 });

        const user = await User.populate(chat, {
          path: "latestMessage.sender",
          select: "username avatar email _id",
        });

        return user;
      }
      throw new AuthenticationError("Not logged in");
    },
    getAllMessages: async (parent, { chatId }, context) => {
      if (context.user) {
        const getMessage = await Message.find({ chat: chatId })
          .populate("sender", "username avatar email _id")
          .populate("chat");

        return getMessage;
      }
      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {},
};
