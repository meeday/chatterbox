import { gql } from "@apollo/client";

export const QUERY_ME = gql`
  {
    me {
      _id
      username
      email
      bio
      avatar
    }
  }
`;

export const QUERY_USER = gql`
  query searchUser($username: String!) {
    searchUser(username: $username) {
      _id
      avatar
      bio
      email
      username
    }
  }
`;

export const QUERY_CHAT = gql`
  query getChat($userId: ID!) {
    getChat(userId: $userId) {
      _id
      chatName
      groupAdmin {
        _id
        avatar
        bio
        email
        username
      }
      isGroupChat
      latestMessage {
        _id
        message
        sender {
          _id
          avatar
          bio
          email
          username
        }
      }
      users {
        _id
        avatar
        bio
        email
        username
      }
    }
  }
`;

export const QUERY_ALL_CHATS = gql`
  query getAllChats {
    getAllChats {
      _id
      chatName
      groupAdmin {
        _id
        avatar
        username
      }
      isGroupChat
      latestMessage {
        _id
        message
        sender {
          _id
          avatar
          username
        }
      }
      users {
        _id
        avatar
        username
      }
    }
  }
`;

export const QUERY_ALL_MESSAGES = gql`
  query getAllMessages($chatId: ID) {
    getAllMessages(chatId: $chatId) {
      _id
      chat {
        _id
        chatName
        groupAdmin {
          _id
          bio
          username
        }
        isGroupChat
        latestMessage {
          _id
          message
          sender {
            _id
            bio
            username
          }
        }
        users {
          _id
          username
          avatar
        }
      }
      message
      sender {
        _id
        avatar
        username
      }
    }
  }
`;
