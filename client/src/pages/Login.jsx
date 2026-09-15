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
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;

  .body {
    position: relative;
    z-index: 2;

    width: 100%;
    min-height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;

    padding: 2rem;
  }

    .brand {
    position: fixed;
    top: 25px;
    left: 40px;

    z-index: 100;

    cursor: pointer;
  }

  .brand img {
    width: 170px;
    height: auto;

    display: block;

    transition: transform 0.25s ease, filter 0.25s ease;
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

  @media (max-width: 768px) {
    .brand {
      top: 20px;
      left: 25px;
    }

    .brand img {
      width: 140px;
    }
  }

  @media (max-width: 480px) {
    .brand {
      top: 15px;
      left: 18px;
    }

    .brand img {
      width: 110px;
    }
  }
    
  .text {
    display: none;
  }

  .form {
    width: 100%;
    max-width: 430px;

    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    padding: 2.8rem;

    background: rgba(18, 18, 18, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);

    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;

    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 0 35px rgba(229, 9, 20, 0.12);

    transition: all 0.35s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow:
        0 25px 70px rgba(0, 0, 0, 0.65),
        0 0 45px rgba(229, 9, 20, 0.2);
    }
  }

  .form h1 {
    color: #fff;
    text-align: center;
    font-size: 2.2rem;
    margin-bottom: 0.8rem;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .form input {
    height: 56px;
    padding: 0 18px;

    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;

    background: rgba(255, 255, 255, 0.06);
    color: white;

    font-size: 1rem;

    transition: 0.3s ease;

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    &:focus {
      outline: none;
      border-color: #e50914;
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 15px rgba(229, 9, 20, 0.4);
    }
  }

  .form button {
    height: 56px;

    border: none;
    border-radius: 12px;

    background: linear-gradient(135deg, #e50914, #ff2d55);
    color: white;

    font-size: 1rem;
    font-weight: 700;

    cursor: pointer;
    transition: 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(229, 9, 20, 0.45);
    }
  }

  .bottom {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.4rem;

    margin-top: 0.5rem;

    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;

    a {
      color: #ff2d55;
      text-decoration: none;
      font-weight: 600;
      transition: 0.3s;
    }

    a:hover {
      color: #ffffff;
    }
  }

  @media (max-width: 768px) {
    .body {
      padding: 1rem;
    }

    .form {
      max-width: 100%;
      padding: 2rem;
    }

    .form h1 {
      font-size: 1.8rem;
    }
  }
`;