import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLazyQuery, useMutation } from "@apollo/client";
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
} from "@chakra-ui/react";

import UserBadgeItem from "./UserBadgeItem";
import UserListItem from "./UserListItem";
import { toast } from "react-toastify";
import { QUERY_USER } from "../utils/queries";
import { CREATE_GROUP_CHAT } from "../utils/mutations";
import { setChats, setSelectedChat } from "../reducers/chatReducer";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const { auth, chat, notification } = useSelector((state) => state);

  const [createGroupChat, { error }] = useMutation(CREATE_GROUP_CHAT);
  const [
    runUserQuery,
    { loading: loadingUser, data: userData, error: userError },
  ] = useLazyQuery(QUERY_USER);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      runUserQuery({ variables: { username: query } });
      setLoading(false);
      setSearchResult(userData.searchUser);
    } catch (error) {
      toast.error(error);
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast.error("User Already Added!");
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast.error("Please Fill Up All The Fields");
      return;
    }
    try {
      const { data } = await createGroupChat({
        variables: {
          chatName: groupChatName,
          users: selectedUsers.map((u) => u._id),
        },
      });

      dispatch(setChats([data.createGroupChat, ...chat.chats]));
      dispatch(setSelectedChat(data.createGroupChat));
      onClose();
      toast.success("SuccessFully Created New Group");
    } catch (error) {
      toast.error("Failed To Create Group");
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            display="flex"
            justifyContent="center"
            fontFamily="Poppins"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Group Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users:"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>
            {loading ? (
              <div>Loading...</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              fontFamily="Poppins"
              onClick={handleSubmit}
              colorScheme="blue"
              background=" rgba(67, 43, 255, 0.8)"
              _hover={{
                background: " rgba(67, 43, 255, 0.8)",
                color: "white",
              }}
            >
              Create Group Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
