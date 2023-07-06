import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        _id
        username
        bio
        avatar
        email
      }
    }
  }
`;

export const SIGNUP = gql`
  mutation signup($userData: UserInput!) {
    signup(userData: $userData) {
      token
      user {
        _id
        username
        bio
        avatar
        email
      }
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation createChat($chatName: String!, $users: [String!]) {
    createChat(chatName: $chatName, users: $users) {
      _id
      chatName
      groupAdmin {
        _id
      }
      isGroupChat
      latestMessage {
        _id
        message
        sender {
          _id
          username
        }
      }
      users {
        _id
        username
      }
    }
  }
`;

export const RENAME_CHAT = gql`
  mutation renameChat($chatId: ID!, $chatName: String!) {
    renameChat(chatId: $chatId, chatName: $chatName) {
      _id
      chatName
      groupAdmin {
        _id
      }
      isGroupChat
      latestMessage {
        _id
        message
        sender {
          _id
          username
        }
      }
      users {
        _id
        username
      }
    }
  }
`;

export const REMOVE_USER_FROM_CHAT = gql`
  mutation removeUserFromChat($chatId: ID!, $userId: ID!) {
    removeUserFromChat(chatId: $chatId, userId: $userId) {
      _id
      chatName
      groupAdmin {
        _id
        username
      }
      isGroupChat
      latestMessage {
        _id
        message
        sender {
          _id
          username
        }
      }
      users {
        _id
        username
      }
    }
  }
`;

export const ADD_USER_TO_CHAT = gql`
  mutation addUserToChat($chatId: ID!, $userId: ID!) {
    addUserToChat(chatId: $chatId, userId: $userId) {
      _id
      chatName
      groupAdmin {
        _id
        username
      }
      isGroupChat
      latestMessage {
        _id
        message
        sender {
          _id
          username
        }
      }
      users {
        _id
        username
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation sendMessage($message: String!, $chatId: ID!) {
    sendMessage(message: $message, chatId: $chatId) {
      _id
      message
      chat {
        _id
        chatName
        isGroupChat
        latestMessage {
          _id
          message
          sender {
            _id
            username
          }
        }
        users {
          _id
          username
        }
      }
    }
  }
`;
