import { useEffect } from "react";
import { toast } from "sonner";
import { clearFeedback } from "@/store/feedbackSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export function FeedbackSnackbar() {
  const dispatch = useAppDispatch();
  const feedback = useAppSelector((state) => state.feedback);

  useEffect(() => {
    if (!feedback.message) return;

    if (feedback.type === "error") toast.error(feedback.message);
    if (feedback.type === "success") toast.success(feedback.message);
    if (feedback.type === "info") toast.message(feedback.message);

    dispatch(clearFeedback());
  }, [dispatch, feedback]);

  return null;
}
