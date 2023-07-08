import { createSlice } from "@reduxjs/toolkit";

export const authReducer = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
    user: {
      token: "",
      username: "",
      userId: "",
      email: "",
      bio: "",
      avatar: "",
    },
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
          email: action.payload.email,
          bio: action.payload.bio,
          avatar: action.payload.avatar,
        },
      };
    },

    logout(state) {
      return {
        ...state,
        isLoggedIn: false,
        user: {
          token: "",
          username: "",
          userId: "",
          email: "",
          bio: "",
          avatar: "",
        },
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
          email: action.payload.email,
          bio: action.payload.bio,
          avatar: action.payload.avatar,
        },
      };
    },
  },
});

export const { login_user, logout, signup_user } = authReducer.actions;
export default authReducer.reducer;
