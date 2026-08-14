import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import BackgroundImage from "../components/BackgroundImage";
import Header from "../components/Header";
import logo from "../assets/logo.png";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, reload, onAuthStateChanged } from "firebase/auth"
import { firebaseAuth } from "../Utils/firebase-config";
import { useNavigate } from "react-router-dom";
import axios from "axios";


export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

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

    const { email, password } = formValues;

    if (!email || !password || !confirmPassword) {
      toast.error("Please enter all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      
      await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, {
              firebaseUid: userCredential.user.uid,
              name,
              email: userCredential.user.email,
            });

      await sendEmailVerification(userCredential.user);

      await signOut(firebaseAuth);

      navigate("/login", {
        state: { verificationEmailSent: true },
      });

    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("An account with this email already exists.");
          break;

        case "auth/invalid-email":
          toast.error("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          toast.error("Password must be at least 6 characters long.");
          break;

        case "auth/network-request-failed":
          toast.error(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          toast.error(
            "Unable to create your account. Please try again."
          );
      }
    }
  };

  return (
    <Container>
    <BackgroundImage />
     <div className="logo">
            <img src={logo} alt="logo" />
          </div>
      <div className="body">
        <div className="text">
          <h1>Unlimited Entertainment, All in One Place</h1>

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
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </>
          )}

          <button onClick={handleSignUp}>
            {showPassword ? "Sign Up" : "Get Started"}
          </button>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;

  .logo {
    position: absolute;
    top: 25px;
    left: 40px;

    z-index: 10;

    display: flex;
    align-items: center;
  }

  .logo img {
    width: 170px;
    height: auto;

    display: block;
    object-fit: contain;
  }

  .body {
    position: relative;
    z-index: 1;

    min-height: 100vh;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    text-align: center;
    color: white;

    padding: 2rem;
  }

  .text {
    max-width: 850px;
    margin-bottom: 2rem;

    h1 {
      font-size: 3.8rem;
      font-weight: 900;
      margin-bottom: 1rem;
    }

    h2 {
      font-size: 1.7rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    h6 {
      font-size: 1.2rem;
      font-weight: 400;
    }
  }

  .form {
    width: 100%;
    max-width: 500px;

    display: flex;
    flex-direction: column;
    gap: 1rem;

    input {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      color: white;
      background: rgba(22, 22, 22, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 4px;
      outline: none;
      box-sizing: border-box;

      &::placeholder {
        color: #b3b3b3;
      }

      &:focus {
        border-color: white;
      }
    }

    button {
      width: 100%;
      padding: 1rem;
      background: #e50914;
      color: white;
      font-size: 1.2rem;
      font-weight: 700;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: 0.3s;
    }

    button:hover {
      background: #c11119;
    }
  }

  @media (max-width: 768px) {
    .logo {
      top: 20px;
      left: 20px;
    }

    .logo img {
      width: 130px;
    }

    .text {
      h1 {
        font-size: 2.5rem;
      }

      h2 {
        font-size: 1.3rem;
      }

      h6 {
        font-size: 1rem;
      }
    }

    .form {
      max-width: 90%;
    }
  }
`;