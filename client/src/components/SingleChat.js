import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { isEmpty } from "lodash";
import { socket } from "../socket";

import {
  Box,
  FormControl,
  Input,
  Spinner,
  Text,
  Avatar,
} from "@chakra-ui/react";
import { toast } from "react-toastify";
import {
  getSender,
  getSenderFull,
  getUserThatsNotLoggedIn,
} from "../utils/chatUtils";
import ProfileModal from "./ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModel from "./UpdateGroupChatModel";
import { setSelectedChat } from "../reducers/chatReducer";
import { setNotifications } from "../reducers/notificationReducer";
import { QUERY_ALL_MESSAGES, QUERY_ALL_CHATS } from "../utils/queries";
import { SEND_MESSAGE } from "../utils/mutations";

let selectedChatCompare;

export default function SingleChat() {
  const { auth, chat, notification } = useSelector((state) => state);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sendMessage, { error }] = useMutation(SEND_MESSAGE);
  const dispatch = useDispatch();

  const { loading, data } = useQuery(QUERY_ALL_MESSAGES, {
    variables: { chatId: chat.selectedChat._id },
  });

  useEffect(() => {
    if (data && data.getAllMessages) {
      setMessages(data.getAllMessages);
      selectedChatCompare = chat.selectedChat;
    }
  }, [data, chat.selectedChat]);

  useEffect(() => {
    socket.emit("setup", auth.user);

    socket.on("connected", () => setSocketConnected(true));

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop-typing", () => setIsTyping(false));
  }, [auth.user, chat.selectedChat]);

  useEffect(() => {
    socket.on("message-received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // notification
        if (!notification.notifications.includes(newMessageReceived)) {
          dispatch(
            setNotifications([
              newMessageReceived,
              ...notification.notifications,
            ])
          );
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  }, [
    chat.chats,
    messages,
    notification.notifications,
    dispatch,
    chat.selectedChat,
  ]);

  const sendNewMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop-typing", chat.selectedChat._id);

      try {
        const { data } = await sendMessage({
          variables: { message: newMessage, chatId: chat.selectedChat._id },
        });

        setNewMessage("");
        socket.emit("new-message", data.sendMessage);
        setMessages([...messages, data.sendMessage]);
      } catch (error) {
        toast.error(error);
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", chat.selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop-typing", chat.selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <Box
      display={{ base: "flex", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      {!isEmpty(chat.selectedChat) ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Poppins"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            {!chat.selectedChat.isGroupChat && chat.selectedChat !== {} ? (
              <>
                <span style={{ display: "flex" }}>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={
                      getUserThatsNotLoggedIn(
                        auth.user,
                        chat.selectedChat.users
                      ).username
                    }
                    src={
                      getUserThatsNotLoggedIn(
                        auth.user,
                        chat.selectedChat.users
                      ).avatar
                    }
                  />
                  <span>
                    {
                      getUserThatsNotLoggedIn(
                        auth.user,
                        chat.selectedChat.users
                      ).username
                    }
                  </span>
                </span>
                <ProfileModal
                  user={getUserThatsNotLoggedIn(
                    auth.user,
                    chat.selectedChat.users
                  )}
                />
              </>
            ) : (
              <>
                {chat.selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModel />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="message">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendNewMessage} h="15%" isRequired mt={3}>
              {isTyping ? <div>Typing ...</div> : <></>}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Poppins">
            Click On Users to Start Conversation
          </Text>
        </Box>
      )}
    </Box>
  );
}
