import { useEffect, useState } from "react";
import {
    useNavigate,
    useLocation,
} from "react-router-dom";

import {
    sendEmailVerification,
    signOut,
    reload,
} from "firebase/auth";

import { firebaseAuth } from "../utils/firebase-config";

import styled from "styled-components";
import { toast } from "react-toastify";
import BackgroundImage from "../components/BackgroundImage";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState("verifying");

  const [email] = useState(
    location.state?.email || ""
  );

  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
const checkEmailVerification = async () => {
  const user = firebaseAuth.currentUser;

  if (!user) {
    return;
  }

  try {
    await reload(user);

    if (user.emailVerified) {
      localStorage.removeItem("verificationSentAt");
      setStatus("success");
    } else {
      setStatus("waiting");
    }
  } catch (error) {
    console.error(
      "Email verification check error:",
      error
    );
  }
};

useEffect(() => {
  checkEmailVerification();

  const interval = setInterval(() => {
    checkEmailVerification();
  }, 2000);

  return () => {
    clearInterval(interval);
  };
}, []);


  useEffect(() => {
    if (status !== "success") {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await signOut(firebaseAuth);
      } finally {
        navigate("/login", {
          replace: true,
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [status, navigate]);

  useEffect(() => {
    const updateCountdown = () => {
      const sentAt =
        localStorage.getItem(
          "verificationSentAt"
        );

      if (!sentAt) {
        setCountdown(0);
        return;
      }

      const elapsed =
        Date.now() - Number(sentAt);

      const remaining = Math.ceil(
        (30000 - elapsed) / 1000
      );

      if (remaining <= 0) {
        setCountdown(0);

        localStorage.removeItem(
          "verificationSentAt"
        );
      } else {
        setCountdown(remaining);
      }
    };

    updateCountdown();

    const timer = setInterval(
      updateCountdown,
      1000
    );

    return () => clearInterval(timer);
  }, []);

  const handleResendVerification = async () => {
    if (
      countdown > 0 ||
      isResending
    ) {
      return;
    }

    const user =
      firebaseAuth.currentUser;

    if (!user) {
      toast.error(
        "Your signup session has expired. Please sign up again."
      );

      navigate("/signup");
      return;
    }

    setIsResending(true);

    try {
      await reload(user);

      if (user.emailVerified) {
        setStatus("success");
        return;
      }

      await sendEmailVerification(user);

      localStorage.setItem(
        "verificationSentAt",
        Date.now().toString()
      );

      setCountdown(30);

      toast.success(
        "Verification email sent again!"
      );

    } catch (error) {
      console.error(
        "Resend verification error:",
        error
      );

      switch (error.code) {
        case "auth/too-many-requests":
          toast.error(
            "Too many verification emails have been requested. Please wait a while before trying again."
          );
          break;

        case "auth/network-request-failed":
          toast.error(
            "Network error. Please check your connection."
          );
          break;

        default:
          toast.error(
            "Unable to resend verification email."
          );
      }

    } finally {
      setIsResending(false);
    }
  };

  if (status === "success") {
    return (
      <Container>
        <BackgroundImage />

        <div className="content">
          <div className="card">

            <div className="successIcon">
              ✓
            </div>

            <h1>
              Email Verified Successfully!
            </h1>

            <p>
              Your email has been verified successfully.
            </p>

            <p>
              Redirecting you to login...
            </p>

            <div className="loader">
              Redirecting...
            </div>

          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <BackgroundImage />

      <div className="content">
        <div className="card">

          {status === "verifying" ? (
            <>
              <h1>
                Checking your email...
              </h1>

              <p>
                Please wait while we check
                your verification status.
              </p>
            </>
          ) : status === "waiting" ? (
            <>
              <h1>
                Verify Your Email
              </h1>

              <p>
                We sent a verification link to:
              </p>

              <strong>
                {email}
              </strong>

              <p>
                Please open your email and click
                the verification link.
              </p>

              <p>
                After verifying your email,
                return to this page.
              </p>

              <div className="resendBox">

                <h3>
                  Didn't receive the email?
                </h3>

                <button
                  onClick={
                    handleResendVerification
                  }
                  disabled={
                    countdown > 0 ||
                    isResending
                  }
                >
                  {isResending
                    ? "Sending..."
                    : countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend Verification"}
                </button>

              </div>
            </>
          ) : (
            <>
              <h1>
                Verification Session Expired
              </h1>

              <p>
                Your signup session has expired.
                Please start the signup process again.
              </p>

              <button
                onClick={() =>
                  navigate("/signup")
                }
              >
                Back to Sign Up
              </button>
            </>
          )}

        </div>
      </div>
    </Container>
  );
}




const Container = styled.div`

  width: 100%;

  min-height: 100vh;

  position: relative;


  .content {

    position: relative;

    z-index: 2;

    min-height: 100vh;

    display: flex;

    justify-content: center;

    align-items: center;

    padding: 2rem;

  }


  .card {

    width: 100%;

    max-width: 500px;

    padding: 3rem 2rem;

    text-align: center;

    background:
      rgba(22, 22, 22, 0.9);

    border-radius: 8px;

    color: white;

  }


  h1 {

    font-size: 2rem;

    margin-bottom: 1rem;

  }


  p {

    color: #b3b3b3;

    font-size: 1.1rem;

    margin-bottom: 1rem;

  }


  strong {

    display: block;

    margin-bottom: 1.5rem;

    word-break: break-word;

  }


  .successIcon {

    width: 70px;

    height: 70px;

    margin:
      0 auto 1.5rem;

    display: flex;

    justify-content: center;

    align-items: center;

    background: #2ecc71;

    border-radius: 50%;

    font-size: 2.5rem;

    font-weight: bold;

  }


  .loader {

    margin-top: 1.5rem;

    color: #e50914;

    font-weight: bold;

  }


  .resendBox {

    margin-top: 2rem;

  }


  .resendBox h3 {

    margin-bottom: 1rem;

  }


  button {

    width: 100%;

    padding: 1rem;

    margin-top: 1rem;

    background: #e50914;

    color: white;

    border: none;

    border-radius: 4px;

    font-size: 1rem;

    font-weight: bold;

    cursor: pointer;

  }


  button:hover {

    background: #c11119;

  }


  button:disabled {

    opacity: 0.6;

    cursor: not-allowed;

  }

`;


