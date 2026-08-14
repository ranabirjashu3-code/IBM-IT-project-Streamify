import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import styled from "styled-components";


export default function Header({ login, hideButton }) {
  const navigate = useNavigate();

  return (
    <Container>
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>

      {!hideButton && (
        <button onClick={() => navigate(login ? "/login" : "/signup")}>
          {login ? "Login" : "Sign Up"}
        </button>
      )}
    </Container>
  );
}

const Container = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;

  padding: 1.5rem 4rem;
  box-sizing: border-box;
  z-index: 100;

  display: flex;
  justify-content: space-between;
  align-items: center;

  .logo {
    display: flex;
    align-items: center;
  }

  .logo img {
    width: 170px;
    height: auto;
    cursor: pointer;
    user-select: none;
  }

  button {
    background: #e50914;
    color: #fff;

    border: none;
    outline: none;

    padding: 0.75rem 1.8rem;
    border-radius: 6px;

    font-size: 1rem;
    font-weight: 600;

    cursor: pointer;

    transition: all 0.3s ease;

    &:hover {
      background: #c11119;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(229, 9, 20, 0.35);
    }

    &:active {
      transform: scale(0.97);
    }
  }

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;

    .logo img {
      width: 120px;
    }

    button {
      padding: 0.65rem 1.3rem;
      font-size: 0.9rem;
    }
  }
`;