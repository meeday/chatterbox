import { createSlice } from "@reduxjs/toolkit";

export const notificationReducer = createSlice({
  name: "notification",
  initialState: { notifications: [] },
  reducers: {
    setNotifications(state, action) {
      return {
        ...state,
        notifications: action.payload,
      };
    },
  },
});

export const { setNotifications } = notificationReducer.actions;

export default notificationReducer.reducer;
