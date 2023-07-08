import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer";
import chatReducer from "./reducers/chatReducer";
import notificationReducer from "./reducers/notificationReducer";

export default configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    notification: notificationReducer,
  },
});
