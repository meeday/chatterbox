import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import io from "socket.io-client";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { toast } from "react-toastify";
import { getSender, getSenderFull } from "../utils/chatUtils";
import ProfileModal from "./ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModel from "./UpdateGroupChatModel";
import { setSelectedChat, setChats } from "../reducers/chatReducer";
import { setNotifications } from "../reducers/notificationReducer";
import { QUERY_ALL_MESSAGES, QUERY_ALL_CHATS } from "../utils/queries";
import { SEND_MESSAGE } from "../utils/mutations";

let socket, selectedChatCompare;

export default function SingleChat() {
  const { auth, chat, notification } = useSelector((state) => state);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sendMessage, { error }] = useMutation(SEND_MESSAGE);
  const dispatch = useDispatch;

  const { loading, data } = useQuery(QUERY_ALL_MESSAGES, {
    variables: { chatId: chat.selectedChat._id },
  });

  const [
    runAllChatsQuery,
    { loading: loadingAllChats, data: AllChatData, error: chatError },
  ] = useLazyQuery(QUERY_ALL_CHATS);

  useEffect(() => {
    if (data && data.getAllMessages) {
      setMessages(data.getAllMessages);
      selectedChatCompare = chat.selectedChat;
    }
  }, [data, chat.selectedChat]);

  useEffect(() => {
    socket = io(process.env.REACT_APP_SOCKET_ENDPOINT);
    socket.emit("setup", auth.user);

    socket.on("connected", () => setSocketConnected(true));

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop-typing", () => setIsTyping(false));
  }, []);

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
          runAllChatsQuery();
          dispatch(setChats([AllChatData.getAllChat.chats, ...chat.chats]));
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  }, [AllChatData, dispatch]);

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
    <>
      {Object.keys(chat.selectedChat).length > 0 ? (
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
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!chat.selectedChat.isGroupChat ? (
              <>
                {getSender(auth.user, chat.selectedChat.users)}
                <ProfileModal
                  user={getSenderFull(auth.user, chat.selectedChat.users)}
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
            <FormControl onKeyDown={sendMessage} h="15%" isRequired mt={3}>
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
    </>
  );
}
