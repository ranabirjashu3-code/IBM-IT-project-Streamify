import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import BackgroundImage from "../components/BackgroundImage";
import logo from "../assets/logo.png";
import { signInWithEmailAndPassword, reload, signOut, onAuthStateChanged } from "firebase/auth"
import { firebaseAuth } from "../Utils/firebase-config";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";


export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (location.state?.verificationEmailSent) {
      toast.success(
        "Verification email sent. Please check your inbox and verify your email before logging in.",
        {
          toastId: "verification-email",
        }
      );
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const handleLogin = async () => {
    // Prevent double clicking
    if (isLoggingIn) {
      return;
    }

    const { email, password } = formValues;

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      const user = userCredential.user;

      // Refresh Firebase user information
      await reload(user);

      // Email not verified
      if (!user.emailVerified) {
        await signOut(firebaseAuth);

        toast.error(
          "Please verify your email before logging in.",
          {
            toastId: "email-not-verified",
          }
        );

        return;
      }

      // --------------------------------
      // EMAIL IS VERIFIED
      // --------------------------------

      // Create/find user in MongoDB
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users`,
        {
          firebaseUid: user.uid,
          email: user.email,
          name: user.displayName || "",
        }
      );

      toast.success("Login successful!", {
        toastId: "login-success",
      });

      navigate("/");

    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/user-not-found":
          toast.error("No account found with this email.");
          break;

        case "auth/wrong-password":
          toast.error("Incorrect password.");
          break;

        case "auth/invalid-credential":
          toast.error("Invalid email or password.");
          break;

        case "auth/invalid-email":
          toast.error("Please enter a valid email address.");
          break;

        case "auth/too-many-requests":
          toast.error(
            "Too many failed attempts. Please try again later."
          );
          break;

        case "auth/network-request-failed":
          toast.error(
            "Network error. Check your internet connection."
          );
          break;

        default:
          toast.error(
            "Something went wrong. Please try again."
          );
          console.error(error.message);
      }

    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Container>
      <BackgroundImage />

      <div className="body">
        <div className="text">
        </div>
        <div className="brand">
          <img src={logo} alt="logo" onClick={() => navigate("/")} />
        </div>
        <div className="form">
          <h1>Welcome Back</h1>
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={formValues.email}
            onChange={(e) => setFormValues({ ...formValues, [e.target.name]: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formValues.password}
            onChange={(e) => setFormValues({ ...formValues, [e.target.name]: e.target.value })}
          />

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging In..." : "Log In"}
          </button>
          <div className="bottom">
            <span>Don't have an account?</span>
            <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  /* =========================================================
     PAGE CONTAINER
  ========================================================= */

  position: relative;

  width: 100%;
  min-height: 100vh;

  overflow: hidden;

  background: #0b0b0b;


  /* =========================================================
     BODY
  ========================================================= */

  .body {
    position: relative;

    z-index: 2;

    width: 100%;
    min-height: 100vh;

    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 2rem;
  }


  /* =========================================================
     BRAND / LOGO
  ========================================================= */

  .brand {
    position: fixed;

    top: 25px;
    left: 40px;

    z-index: 100;

    display: flex;
    align-items: center;

    cursor: pointer;
  }

  .brand img {
    display: block;

    width: 170px;
    height: auto;

    object-fit: contain;

    user-select: none;

    transition:
      transform 0.25s ease,
      filter 0.25s ease;
  }

  .brand img:hover {
    transform: scale(1.05);

    filter:
      drop-shadow(
        0 5px 18px rgba(229, 9, 20, 0.35)
      );
  }

  .brand img:active {
    transform: scale(0.98);
  }


  /* =========================================================
     OPTIONAL TEXT
  ========================================================= */

  .text {
    display: none;
  }


  /* =========================================================
     FORM CARD
  ========================================================= */

  .form {
    width: 100%;
    max-width: 430px;

    box-sizing: border-box;

    display: flex;
    flex-direction: column;

    gap: 1.25rem;

    padding: 2.8rem;

    background:
      linear-gradient(
        145deg,
        rgba(25, 25, 25, 0.88),
        rgba(12, 12, 12, 0.78)
      );

    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);

    border: 1px solid rgba(255, 255, 255, 0.09);

    border-radius: 20px;

    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 0 35px rgba(229, 9, 20, 0.12);

    transition:
      transform 0.35s ease,
      box-shadow 0.35s ease,
      border-color 0.35s ease;
  }

  .form:hover {
    transform: translateY(-5px);

    border-color:
      rgba(255, 255, 255, 0.13);

    box-shadow:
      0 25px 70px rgba(0, 0, 0, 0.65),
      0 0 45px rgba(229, 9, 20, 0.2);
  }


  /* =========================================================
     FORM TITLE
  ========================================================= */

  .form h1 {
    margin: 0 0 0.8rem;

    color: #ffffff;

    text-align: center;

    font-size: 2.2rem;

    font-weight: 700;

    line-height: 1.2;

    letter-spacing: 1px;

    text-shadow:
      0 3px 15px rgba(0, 0, 0, 0.4);
  }


  /* =========================================================
     INPUTS
  ========================================================= */

  .form input {
    width: 100%;
    height: 56px;

    box-sizing: border-box;

    padding: 0 18px;

    border: 1px solid
      rgba(255, 255, 255, 0.15);

    border-radius: 12px;

    outline: none;

    background:
      rgba(255, 255, 255, 0.055);

    color: #ffffff;

    font-family: inherit;

    font-size: 1rem;

    caret-color: #ff2d55;

    transition:
      border-color 0.25s ease,
      background 0.25s ease,
      box-shadow 0.25s ease,
      transform 0.2s ease;
  }

  .form input::placeholder {
    color:
      rgba(255, 255, 255, 0.55);
  }

  .form input:hover {
    border-color:
      rgba(255, 255, 255, 0.25);

    background:
      rgba(255, 255, 255, 0.07);
  }

  .form input:focus {
    border-color: #e50914;

    background:
      rgba(255, 255, 255, 0.08);

    box-shadow:
      0 0 0 3px
        rgba(229, 9, 20, 0.1),
      0 0 18px
        rgba(229, 9, 20, 0.28);
  }

  .form input:focus::placeholder {
    color:
      rgba(255, 255, 255, 0.35);
  }


  /* =========================================================
     AUTOFILL FIX
  ========================================================= */

  .form input:-webkit-autofill,
  .form input:-webkit-autofill:hover,
  .form input:-webkit-autofill:focus {
    -webkit-text-fill-color: #ffffff;

    -webkit-box-shadow:
      0 0 0 1000px #191919 inset;

    transition:
      background-color 9999s ease-in-out 0s;
  }


  /* =========================================================
     SUBMIT BUTTON
  ========================================================= */

  .form button {
    width: 100%;
    height: 56px;

    box-sizing: border-box;

    border: none;

    border-radius: 12px;

    background:
      linear-gradient(
        135deg,
        #e50914 0%,
        #ff2d55 100%
      );

    color: #ffffff;

    font-family: inherit;

    font-size: 1rem;

    font-weight: 700;

    cursor: pointer;

    outline: none;

    box-shadow:
      0 8px 20px
        rgba(229, 9, 20, 0.2);

    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease,
      filter 0.25s ease;
  }

  .form button:hover {
    transform: translateY(-2px);

    filter: brightness(1.05);

    box-shadow:
      0 12px 28px
        rgba(229, 9, 20, 0.4);
  }

  .form button:active {
    transform: translateY(0) scale(0.98);

    box-shadow:
      0 6px 15px
        rgba(229, 9, 20, 0.25);
  }

  .form button:focus-visible {
    box-shadow:
      0 0 0 3px
        rgba(255, 255, 255, 0.15),
      0 10px 25px
        rgba(229, 9, 20, 0.4);
  }


  /* =========================================================
     BOTTOM TEXT
  ========================================================= */

  .bottom {
    display: flex;

    align-items: center;
    justify-content: center;

    flex-wrap: wrap;

    gap: 0.4rem;

    margin-top: 0.5rem;

    color:
      rgba(255, 255, 255, 0.7);

    font-size: 0.95rem;

    line-height: 1.5;

    text-align: center;
  }

  .bottom a {
    color: #ff2d55;

    text-decoration: none;

    font-weight: 600;

    transition:
      color 0.25s ease,
      text-shadow 0.25s ease;
  }

  .bottom a:hover {
    color: #ffffff;

    text-shadow:
      0 0 10px
        rgba(255, 45, 85, 0.45);
  }


  /* =========================================================
     TABLET
  ========================================================= */

  @media (max-width: 768px) {

    .body {
      min-height: 100vh;

      padding:
        6rem 1.25rem 2rem;
    }


    /* LOGO */

    .brand {
      top: 20px;
      left: 25px;
    }

    .brand img {
      width: 140px;
    }


    /* FORM */

    .form {
      max-width: 100%;

      padding: 2rem;

      border-radius: 18px;
    }

    .form h1 {
      font-size: 1.8rem;
    }
  }


  /* =========================================================
     MOBILE
  ========================================================= */

  @media (max-width: 480px) {

    .body {
      padding:
        5.5rem 1rem 1.5rem;
    }


    /* LOGO */

    .brand {
      top: 15px;
      left: 18px;
    }

    .brand img {
      width: 110px;
    }


    /* FORM */

    .form {
      width: 100%;

      padding: 1.6rem 1.25rem;

      gap: 1rem;

      border-radius: 16px;

      box-shadow:
        0 18px 45px
          rgba(0, 0, 0, 0.6),
        0 0 25px
          rgba(229, 9, 20, 0.1);
    }

    .form:hover {
      transform: none;
    }


    /* TITLE */

    .form h1 {
      margin-bottom: 0.5rem;

      font-size: 1.6rem;

      letter-spacing: 0.5px;
    }


    /* INPUT */

    .form input {
      height: 52px;

      padding: 0 15px;

      border-radius: 10px;

      font-size: 0.95rem;
    }


    /* BUTTON */

    .form button {
      height: 52px;

      border-radius: 10px;

      font-size: 0.95rem;
    }


    /* BOTTOM */

    .bottom {
      font-size: 0.85rem;
    }
  }


  /* =========================================================
     VERY SMALL PHONES
  ========================================================= */

  @media (max-width: 360px) {

    .body {
      padding:
        5rem 0.75rem 1.25rem;
    }

    .brand {
      top: 12px;
      left: 15px;
    }

    .brand img {
      width: 100px;
    }

    .form {
      padding: 1.4rem 1rem;

      border-radius: 14px;
    }

    .form h1 {
      font-size: 1.45rem;
    }

    .form input {
      height: 50px;

      font-size: 0.9rem;
    }

    .form button {
      height: 50px;

      font-size: 0.9rem;
    }

    .bottom {
      font-size: 0.8rem;
    }
  }


  /* =========================================================
     REDUCED MOTION
  ========================================================= */

  @media (prefers-reduced-motion: reduce) {

    .brand img,
    .form,
    .form input,
    .form button,
    .bottom a {
      transition: none;
    }

    .form:hover,
    .form button:hover,
    .brand img:hover {
      transform: none;
    }
  }
`;