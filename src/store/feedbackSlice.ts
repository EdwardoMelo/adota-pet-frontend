import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type FeedbackType = "success" | "error" | "info";

interface FeedbackState {
  message: string;
  type: FeedbackType;
}

const initialState: FeedbackState = {
  message: "",
  type: "info",
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    setFeedback: (state, action: PayloadAction<FeedbackState>) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    clearFeedback: (state) => {
      state.message = "";
      state.type = "info";
    },
  },
});

export const { setFeedback, clearFeedback } = feedbackSlice.actions;
export const feedbackReducer = feedbackSlice.reducer;
