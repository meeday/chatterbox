import { createSlice } from "@reduxjs/toolkit";

export const authReducer = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
    user: { token: "", username: "", userId: "" },
  },
  reducers: {
    login_user(state, action) {
      return {
        ...state,
        isLoggedIn: true,
        user: {
          token: action.payload.token,
          username: action.payload.username,
          userId: action.payload.userId,
        },
      };
    },

    logout(state) {
      return {
        ...state,
        isLoggedIn: false,
        user: { token: "", username: "", userId: "" },
      };
    },

    signup_user(state, action) {
      return {
        ...state,
        isLoggedIn: true,
        user: {
          token: action.payload.token,
          username: action.payload.username,
          userId: action.payload.userId,
        },
      };
    },
  },
});

export const { login_user, logout, signup_user } = authReducer.actions;
export default authReducer.reducer;
