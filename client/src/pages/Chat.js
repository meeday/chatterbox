import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { SideDrawer, MyChats, ChatBox } from "../components";
import { QUERY_ALL_CHATS } from "../utils/queries";
import { setChats } from "../reducers/chatReducer";
const Chat = () => {
  const dispatch = useDispatch();
  const { auth, chat, notification } = useSelector((state) => state);
  const { loading, data } = useQuery(QUERY_ALL_CHATS);

  useEffect(() => {
    if (data) {
      dispatch(setChats(data.getAllChats));
    }
  }, [data, dispatch]);

  return (
    <div style={{ width: "100%" }}>
      {auth.user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {auth.user && <MyChats />}
        {auth.user && <ChatBox />}
      </Box>
    </div>
  );
};

export default Chat;
