import { useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import BackgroundImage from "../components/BackgroundImage";
import logo from "../assets/logo.png";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, signInWithEmailAndPassword, reload } from "firebase/auth";
import { firebaseAuth } from "../Utils/firebase-config";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const handleSignUp = async () => {
    if (!showPassword) {
      setShowPassword(true);
      return;
    }

    if (isSigningUp) {
      return;
    }

    const { email, password } = formValues;

    if (!email || !password || !confirmPassword) {
      toast.error("Please enter all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }

    setIsSigningUp(true);

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          firebaseAuth,
          email,
          password
        );

      await sendEmailVerification(
        userCredential.user
      );

      localStorage.setItem(
        "verificationSentAt",
        Date.now().toString()
      );

      navigate("/verify-email", {
        state: {
          email: email,
        },
      });

    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        try {
          const lastSent =
            localStorage.getItem(
              "verificationSentAt"
            );

          if (
            lastSent &&
            Date.now() - Number(lastSent) < 30 * 1000
          ) {
            const remaining = Math.ceil(
              (
                30 * 1000 -
                (
                  Date.now() -
                  Number(lastSent)
                )
              ) / 1000
            );

            toast.error(
              `Please wait ${remaining} seconds before requesting another verification email.`
            );

            navigate("/verify-email", {
              state: {
                email: email,
              },
            });

            return;
          }

          const existingCredential =
            await signInWithEmailAndPassword(
              firebaseAuth,
              email,
              password
            );

          const existingUser =
            existingCredential.user;

          await reload(existingUser);

          if (existingUser.emailVerified) {
            await signOut(firebaseAuth);

            toast.error(
              "This email is already registered. Please log in."
            );

            return;
          }

          await sendEmailVerification(
            existingUser
          );

          localStorage.setItem(
            "verificationSentAt",
            Date.now().toString()
          );

          navigate("/verify-email", {
            state: {
              email: email,
            },
          });

        } catch (resendError) {
          console.error(
            "Verification error:",
            resendError
          );

          try {
            await signOut(firebaseAuth);
          } catch (signOutError) {
            console.error(signOutError);
          }

          switch (resendError.code) {
            case "auth/invalid-credential":
              toast.error(
                "Incorrect email or password."
              );
              break;

            case "auth/too-many-requests":
              toast.error(
                "Too many requests. Please wait a while before trying again."
              );
              break;

            case "auth/network-request-failed":
              toast.error(
                "Network error. Please check your internet connection."
              );
              break;

            default:
              toast.error(
                "Unable to resend verification email."
              );
          }
        }

        return;
      }

      switch (error.code) {
        case "auth/invalid-email":
          toast.error(
            "Please enter a valid email address."
          );
          break;

        case "auth/weak-password":
          toast.error(
            "Please enter a valid password."
          );
          break;

        case "auth/too-many-requests":
          toast.error(
            "Too many requests. Please wait a while before trying again."
          );
          break;

        case "auth/network-request-failed":
          toast.error(
            "Network error. Please check your connection."
          );
          break;

        default:
          toast.error(
            "Unable to create your account. Please try again."
          );
      }

    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <Container>
      <BackgroundImage />

      <div className="body">
        <div className="text">
            <div className="brand">
                      <img src={logo} alt="logo" onClick={()=> navigate("/")} />
                    </div>
          <h1>
            Unlimited Entertainment, All in One Place
          </h1>

          <h2>
            Watch Your Favorite Movies, Anime and TV Shows Anytime,
            Anywhere.
          </h2>

          <h6>
            Ready to watch? Enter your email to create or restart your
            membership.
          </h6>

        </div>

        <div className="form">

          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={formValues.email}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                [e.target.name]: e.target.value,
              })
            }
          />

          {showPassword && (
            <>
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formValues.password}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    [e.target.name]: e.target.value,
                  })
                }
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />
            </>
          )}

          <button
            onClick={handleSignUp}
            disabled={isSigningUp}
          >
            {isSigningUp
              ? "Signing Up..."
              : showPassword
                ? "Sign Up"
                : "Get Started"}
          </button>

          <div className="bottom">
            <span>Already have an account?</span>
            <button onClick={() => navigate("/login")}>
              Login
            </button>
          </div>

        </div>
      </div>
    </Container>
  );
}


const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;

  .body {
    position: relative;
    z-index: 2;

    width: 100%;
    min-height: 100vh;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    text-align: center;
    color: white;

    padding: 2rem;
    box-sizing: border-box;
  }

  /* =========================
     LOGO - TOP LEFT
  ========================= */

  .brand {
    position: fixed;

    top: 25px;
    left: 40px;

    z-index: 100;

    display: flex;
    align-items: center;
  }

  .brand img {
    width: 170px;
    height: auto;

    display: block;

    cursor: pointer;

    transition:
      transform 0.25s ease,
      filter 0.25s ease;
  }

  .brand img:hover {
    transform: scale(1.05);

    filter: drop-shadow(
      0 5px 18px rgba(229, 9, 20, 0.35)
    );
  }

  .brand img:active {
    transform: scale(0.98);
  }

  /* =========================
     TEXT
  ========================= */

  .text {
    width: 100%;
    max-width: 850px;

    margin-bottom: 2rem;
  }

  .text h1 {
    margin: 0 0 1rem;

    font-size: 3.8rem;
    font-weight: 900;

    line-height: 1.1;

    letter-spacing: -1px;
  }

  .text h2 {
    margin: 0 0 1rem;

    font-size: 1.7rem;
    font-weight: 500;

    line-height: 1.4;

    color: rgba(255, 255, 255, 0.9);
  }

  .text h6 {
    margin: 0;

    font-size: 1.2rem;
    font-weight: 400;

    line-height: 1.5;

    color: rgba(255, 255, 255, 0.75);
  }

  /* =========================
     FORM
  ========================= */

  .form {
    width: 100%;
    max-width: 500px;

    display: flex;
    flex-direction: column;

    gap: 1rem;

    box-sizing: border-box;
  }

  /* =========================
     INPUT
  ========================= */

  .form input {
    width: 100%;
    height: 56px;

    padding: 0 16px;

    box-sizing: border-box;

    background: rgba(22, 22, 22, 0.8);

    color: white;

    border: 1px solid rgba(255, 255, 255, 0.35);

    border-radius: 5px;

    outline: none;

    font-size: 1rem;

    transition:
      border-color 0.25s ease,
      background 0.25s ease,
      box-shadow 0.25s ease;
  }

  .form input::placeholder {
    color: #b3b3b3;
  }

  .form input:hover {
    border-color: rgba(255, 255, 255, 0.5);
  }

  .form input:focus {
    border-color: white;

    background: rgba(30, 30, 30, 0.95);

    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.15);
  }

  /* =========================
     GET STARTED / SIGN UP
  ========================= */

  .form > button {
    width: 100%;
    height: 56px;

    padding: 0 1rem;

    background: #e50914;

    color: white;

    font-size: 1.1rem;
    font-weight: 700;

    border: none;
    border-radius: 5px;

    cursor: pointer;

    transition:
      background 0.25s ease,
      transform 0.2s ease,
      box-shadow 0.25s ease;
  }

  .form > button:hover {
    background: #f40612;

    transform: translateY(-1px);

    box-shadow:
      0 8px 22px rgba(229, 9, 20, 0.35);
  }

  .form > button:active {
    transform: translateY(0);
  }

  .form > button:disabled {
    background: #666;

    color: #bbb;

    cursor: not-allowed;

    transform: none;

    box-shadow: none;
  }

  /* =========================
     ALREADY HAVE ACCOUNT
  ========================= */

  .bottom {
    display: flex;

    align-items: center;
    justify-content: center;

    gap: 5px;

    margin-top: 0.2rem;

    color: #737373;

    font-size: 0.95rem;
  }

  .bottom span {
    color: #f6f0f0;
  }

  .bottom button {
    width: auto;
    height: auto;

    padding: 0;
    margin: 0;

    background: transparent;

    color: #ff2d55;

    font-size: 0.95rem;
    font-weight: 600;

    border: none;
    border-radius: 0;

    cursor: pointer;

    transition:
      color 0.2s ease,
      text-decoration 0.2s ease;
  }

  .bottom button:hover {
    background: transparent;

    color: white;

    transform: none;

    box-shadow: none;

    text-decoration: underline;
  }

  /* =========================
     TABLET
  ========================= */

  @media (max-width: 768px) {
    .body {
      padding: 1.5rem;
    }

    .brand {
      top: 20px;
      left: 25px;
    }

    .brand img {
      width: 140px;
    }

    .text {
      max-width: 90%;
    }

    .text h1 {
      font-size: 2.5rem;
    }

    .text h2 {
      font-size: 1.3rem;
    }

    .text h6 {
      font-size: 1rem;
    }

    .form {
      max-width: 90%;
    }
  }

  /* =========================
     MOBILE
  ========================= */

  @media (max-width: 480px) {
    .body {
      padding: 1rem;
    }

    .brand {
      top: 15px;
      left: 18px;
    }

    .brand img {
      width: 110px;
    }

    .text {
      max-width: 100%;
    }

    .text h1 {
      font-size: 2rem;
    }

    .text h2 {
      font-size: 1.1rem;
    }

    .text h6 {
      font-size: 0.9rem;
    }

    .form {
      max-width: 100%;
    }

    .form input {
      height: 52px;
      font-size: 0.95rem;
    }

    .form > button {
      height: 52px;
      font-size: 1rem;
    }

    .bottom {
      font-size: 0.88rem;
    }

    .bottom button {
      font-size: 0.88rem;
    }
  }

  /* =========================
     VERY SMALL MOBILE
  ========================= */

  @media (max-width: 360px) {
    .brand {
      top: 12px;
      left: 14px;
    }

    .brand img {
      width: 95px;
    }
  }
`;