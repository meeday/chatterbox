import { createSlice } from "@reduxjs/toolkit";

export const chatReducer = createSlice({
  name: "chat",
  initialState: {
    chats: [],
    selectedChat: {},
  },
  reducers: {
    setSelectedChat(state, action) {
      return {
        ...state,
        selectedChat: action.payload,
      };
    },
    setChats(state, action) {
      return {
        ...state,
        chats: action.payload,
      };
    },
  },
});

export const { setSelectedChat, setChats } = chatReducer.actions;

export default chatReducer.reducer;
