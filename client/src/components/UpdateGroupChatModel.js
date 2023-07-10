import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useMutation, useLazyQuery } from "@apollo/client";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  Box,
  IconButton,
  Spinner,
} from "@chakra-ui/react";

import UserBadgeItem from "./UserBadgeItem";
import UserListItem from "./UserListItem";

import { EditIcon } from "@chakra-ui/icons";
import { toast } from "react-toastify";

import {
  REMOVE_USER_FROM_CHAT,
  ADD_USER_TO_CHAT,
  RENAME_CHAT,
} from "../utils/mutations";
import { QUERY_USER, QUERY_ALL_CHATS } from "../utils/queries";
import { setChats, setSelectedChat } from "../reducers/chatReducer";

const UpdateGroupChatModel = () => {
  const dispatch = useDispatch();
  const { auth, chat, notification } = useSelector((state) => state);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);

  const [removeUserFromChat, { error: removeUserError }] = useMutation(
    REMOVE_USER_FROM_CHAT
  );
  const [addUserToChat, { error: addUserError }] =
    useMutation(ADD_USER_TO_CHAT);
  const [renameChat, { error: renameError }] = useMutation(RENAME_CHAT);

  const [
    runAllChatsQuery,
    { loading: loadingAllChats, data: AllChatData, error: chatError },
  ] = useLazyQuery(QUERY_ALL_CHATS);

  const [
    runUserQuery,
    { loading: loadingUser, data: userData, error: userError },
  ] = useLazyQuery(QUERY_USER);

  const handleRemove = async (user1) => {
    if (
      chat.selectedChat.groupAdmin._id !== auth.user.userId &&
      user1._id !== auth.user.userId
    ) {
      toast.error("Only Admin Have Permission To Remove User");
      return;
    }

    try {
      setLoading(true);

      const { data } = removeUserFromChat({
        variables: {
          chatId: chat.selectedChat._id,
          userId: user1._id,
        },
      });
      console.log(data);
      user1._id === auth.user.userId
        ? dispatch(setSelectedChat())
        : dispatch(setSelectedChat(data.removeUserFromGroup));

      runAllChatsQuery();
      dispatch(setChats([AllChatData.getAllChat.chats, ...chat.chats]));

      setLoading(false);
      onClose();
    } catch (error) {
      toast.error(error);
      setLoading(false);
    }
    setGroupChatName("");
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);

      runUserQuery({ variables: { username: search } });

      setLoading(false);
      setSearchResult(userData.searchUser);
    } catch (error) {
      toast.error(error);
    }
  };

  const handleRename = async (e, u) => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);

      const { data } = renameChat({
        variables: { chatId: chat.selectedChat._id, chatName: groupChatName },
      });

      setSelectedChat(data.renameChat);
      runAllChatsQuery();
      dispatch(setChats([AllChatData.getAllChat.chats, ...chat.chats]));
      setRenameLoading(false);
      onClose();
    } catch (error) {
      toast.error(error);
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const handleAddUser = async (user1) => {
    if (chat.selectedChat.users.find((u) => u._id === user1._id)) {
      toast.error("User Already In Group");
      return;
    }

    if (chat.selectedChat.groupAdmin._id !== chat.user._id) {
      toast.error("Ony Admin Can Add Users");
      return;
    }

    try {
      setLoading(true);

      const { data } = addUserToChat({
        variables: {
          chatId: chat.selectedChat._id,
          userId: user1._id,
        },
      });

      setSelectedChat(data.addUserToChat);
      runAllChatsQuery();
      dispatch(setChats([AllChatData.getAllChat.chats, ...chat.chats]));
      setLoading(false);
      onClose();
    } catch (error) {
      toast.error(error);
      setLoading(false);
    }
    setGroupChatName("");
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<EditIcon />}
        onClick={onOpen}
      />
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Poppins"
            display="flex"
            justifyContent="center"
          >
            Update {chat.selectedChat.chatName}
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            fontFamily="Poppins"
          >
            <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
              {chat.selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={chat.selectedChat.groupAdmin}
                  handleFunction={(e) => handleRemove(e, u)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                background=" rgba(67, 43, 255, 0.8)"
                _hover={{
                  background: " rgba(67, 43, 255, 0.8)",
                  color: "white",
                }}
                ml={1}
                isLoading={renameloading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              fontFamily="Poppins"
              onClick={() => handleRemove(auth.user)}
              colorScheme="red"
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModel;
