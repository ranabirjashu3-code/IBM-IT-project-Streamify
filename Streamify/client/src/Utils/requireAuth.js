import { firebaseAuth } from "./firebase-config";
import { toast } from "react-toastify";

export const requireAuth = (navigate) => {
  const user = firebaseAuth.currentUser;

  if (!user || !user.emailVerified) {
    toast.info("Please login to continue.", {
      toastId: "login-required",
    });

    navigate("/login");

    return false;
  }

  return true;
};