import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./GroupChatModal";
import { toast } from "react-toastify";

import { getSender } from "../utils/chatUtils";
import { setSelectedChat, setChats } from "../reducers/chatReducer";

const MyChats = () => {
  const { auth, chat } = useSelector((state) => state);
  const dispatch = useDispatch();

  return (
    <Box
      display={{ base: chat.selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Poppins"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontFamily="Poppins"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chat.chats ? (
          <Stack overflowY="scroll">
            {chat.chats?.map((chat) => (
              <Box
                onClick={() => dispatch(setSelectedChat(chat))}
                cursor="pointer"
                bg={
                  chat.selectedChat === chat
                    ? "rgba(67, 43, 255, 0.8)"
                    : "#E8E8E8"
                }
                color={chat.selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat?._id}
              >
                <Text>
                  {!chat.chats?.isGroupChat
                    ? getSender(auth.user, chat?.users)
                    : chat?.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
