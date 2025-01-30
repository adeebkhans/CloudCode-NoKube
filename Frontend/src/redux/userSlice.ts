import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state
interface UserState {
  id: string | null;
  username: string | null;
  email: string | null;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  id: null,
  username: null,
  email: null,
  isLoggedIn: false,
};

// Create the slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Action to set user details
    setUser(state, action: PayloadAction<{ id: string; username: string; email: string }>) {
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.isLoggedIn = true;
    },
    // Action to clear user details (logout)
    clearUser(state) {
      state.id = null;
      state.username = null;
      state.email = null;
      state.isLoggedIn = false;
    },
  },
});

// Export actions and reducer
export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
