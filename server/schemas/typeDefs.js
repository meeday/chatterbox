const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID!
    username: String
    email: String
    avatar: String
    bio: String
  }

  type Chat {
    _id: ID!
    chatName: String
    isGroupChat: Boolean
    users: [User]
    latestMessage: Message
    groupAdmin: User
  }

  type Message {
    _id: ID!
    sender: User
    message: String
    chat: Chat
  }

  type Auth {
    token: ID!
    user: User
  }

  input UserInput {
    username: String!
    email: String!
    password: String!
    avatar: String
    bio: String
  }

  type Query {
    me: User
    searchUser(username: String!): [User]
    getChat(userId: ID!): Chat
    getAllChats: [Chat]
    getAllMessages(chatId: ID!): [Message]
  }

  type Mutation {
    login(username: String!, password: String!): Auth
    signup(userData: UserInput!): Auth
    createGroupChat(chatName: String!, users: [String]): Chat
    createChat(chatName: String!, user: String): Chat
    renameChat(chatId: ID!, chatName: String!): Chat
    addUserToChat(chatId: ID!, userId: ID!): Chat
    removeUserFromChat(chatId: ID!, userId: ID!): Chat
    sendMessage(message: String!, chatId: ID!): Message
  }
`;

module.exports = typeDefs;
