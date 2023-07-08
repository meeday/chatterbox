import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLazyQuery } from "@apollo/client";
import { Button } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Box, Text } from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
} from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { Spinner } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";

import { toast } from "react-toastify";

import ChatLoading from "./ChatLoading";
import UserListItem from "./UserListItem";
import ProfileModal from "./ProfileModal";

import { logout } from "..//reducers/authReducer";
import { setSelectedChat, setChats } from "../reducers/chatReducer";
import { setNotifications } from "../reducers/notificationReducer";
import { QUERY_USER, QUERY_CHAT } from "../utils/queries";
import { getSender } from "../utils/chatUtils";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [userLoaded, setUserLoaded] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { auth, chat, notification } = useSelector((state) => state);

  const [
    runUserQuery,
    { loading: loadingUser, data: userData, error: userError },
  ] = useLazyQuery(QUERY_USER);

  const [
    runChatQuery,
    { loading: loadingChat, data: chatData, error: chatError },
  ] = useLazyQuery(QUERY_CHAT);

  const handleSearch = async (e) => {
    if (!search) {
      toast.error("Please Provide username");
      return;
    }

    try {
      runUserQuery({ variables: { username: search } });
      setUserLoaded(true);
      setSearchResult(userData.searchUser);
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (userData && userData.searchUser) {
      setUserLoaded(true);
      setSearchResult(userData.searchUser);
    }
  }, [userData]);

  const accessChat = async (userId) => {
    try {
      runChatQuery({ variables: { userId: userId } });

      const IdExists = chat.chats.find(
        (c) => c._id.trim() === chatData.getChat._id.trim()
      );
      if (IdExists) {
        dispatch(setChats([chatData.getChat, ...chat.chats]));
        dispatch(setSelectedChat(chatData.getChat));
        setChatLoaded(true);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("id_token");
    dispatch(logout());
    navigate("/register");
  };
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="linear-gradient(110.29deg, #2E5CFF 11.11%, #973DF0 60.96%)"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <FiSearch />
            <Text d={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text
          fontSize="2xl"
          fontFamily="Poppins"
          css={{
            background: "white",
            textFillColor: "text",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            " -webkit-text-fill-color": "transparent",
            fontWeight: 700,
          }}
        >
          ChatterBox
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              {notification.notifications?.length > 0 ? (
                <>{toast.info(`New Message`)}</>
              ) : null}
              <BellIcon color={"white"} fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.notifications?.length && "No New Message"}
              {notification.notifications?.map((noti) => (
                <MenuItem
                  key={noti._id}
                  onClick={() => {
                    dispatch(setSelectedChat({ selectedChat: noti.chat }));
                    dispatch(
                      setNotifications({
                        payload: notification.notifications.filter(
                          (n) => n !== noti
                        ),
                      })
                    );
                  }}
                >
                  {noti?.chat?.isGroupChat
                    ? `New Message in ${noti?.chat?.chatName} `
                    : ` New Message from ${getSender(
                        auth.user,
                        noti?.chat?.users
                      )}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={auth.user.username}
                src={auth.user.avatar}
              />
            </MenuButton>
            <MenuList>
              <MenuItem>My Profile</MenuItem>
              <ProfileModal user={auth.user} />
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer
        color={"white"}
        placement="left"
        onClose={onClose}
        isOpen={isOpen}
      >
        <DrawerOverlay />
        <DrawerContent>
          <Text
            height="max-content"
            fontSize="20px"
            fontFamily="Poppins"
            alignSelf="center"
            margin="20px"
          >
            Search Users
          </Text>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {userLoaded ? (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            ) : (
              <ChatLoading />
            )}
            {chatLoaded && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
export default SideDrawer;
