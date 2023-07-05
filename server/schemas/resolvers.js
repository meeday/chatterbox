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
  Mutation: {
    login: async (parent, { username, password }) => {
      const user = await User.findOne({ username });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },

    signup: async (parent, { userData }) => {
      const user = await User.create(userData);
      const token = signToken(user);

      return { token, user };
    },

    createChat: async (parent, { users, chatName }, context) => {
      if (context.user) {
        users.push(context.user._id);

        const groupChat = await Chat.create({
          chatName: chatName,
          users: users,
          isGroupChat: true,
          groupAdmin: context.user._id,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
          .populate("users", "-password")
          .populate("groupAdmin", "-password");

        return fullGroupChat;
      }

      throw new AuthenticationError("Not logged in");
    },

    renameChat: async (parent, { chatId, chatName }, context) => {
      if (context.user) {
        const updateChat = await Chat.findByIdAndUpdate(
          chatId,
          {
            chatName: chatName,
          },
          {
            new: true,
          }
        )
          .populate("users", "-password")
          .populate("groupAdmin", "-password");

        if (!updateChat) {
          throw new AuthenticationError("Chat Not Found");
        }
        return updateChat;
      }
      throw new AuthenticationError("Not logged in");
    },

    removeUserFromChat: async (parent, { chatId, userId }, context) => {
      if (context.user) {
        const removeUser = await Chat.findByIdAndUpdate(
          chatId,
          {
            $pull: { users: userId },
          },
          {
            new: true,
          }
        )
          .populate("users", "-password")
          .populate("groupAdmin", "-password");

        if (!removeUser) {
          throw new AuthenticationError("Chat Not Found");
        }

        return removeUser;
      }

      throw new AuthenticationError("Not logged in");
    },

    addUserToChat: async (parent, { chatId, userId }, context) => {
      if (context.user) {
        const addUser = await Chat.findByIdAndUpdate(
          chatId,
          {
            $push: { users: userId },
          },
          {
            new: true,
          }
        )
          .populate("users", "-password")
          .populate("groupAdmin", "-password");

        if (!addUser) {
          throw new AuthenticationError("Chat Not Found");
        }

        return addUser;
      }

      throw new AuthenticationError("Not logged in");
    },

    sendMessage: async (parent, { message, chatId }, context) => {
      if (context.user) {
        let newMessage = {
          sender: context.user._id,
          message: message,
          chat: chatId,
        };

        let m = await Message.create(newMessage);

        m = await m.populate("sender", "username avatar");
        m = await m.populate("chat");
        m = await User.populate(m, {
          path: "chat.users",
          select: "username avatar email _id",
        });

        await Chat.findByIdAndUpdate(
          chatId,
          { latestMessage: m },
          { new: true }
        );

        return m;
      }

      throw new AuthenticationError("Not logged in");
    },
  },
};

module.exports = resolvers;
