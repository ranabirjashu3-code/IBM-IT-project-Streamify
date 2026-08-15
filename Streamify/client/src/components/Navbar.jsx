import React, { useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import logo from "../assets/logo.png";
import { FaPowerOff, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "../Utils/firebase-config";

export default function Navbar({ isScrolled }) {
  const links = [
    { name: "Home", link: "/" },
    { name: "Movies", link: "/movies" },
    { name: "TV Shows", link: "/tv" },
    { name: "Anime", link: "/anime" },
    { name: "Watch List", link: "/watchlist" },
  ];

  const [showSearch, setShoweSearch] = useState(false);
  const [inputHover, setInputHover] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      toast.success("Logout Successful");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };
  return (
    <Container>
      <nav className={isScrolled ? "scrolled" : ""}>
        <div className="left">
          <div className="brand">
            <img src={logo} alt="logo" />
          </div>

          <ul className="links">
            {links.map(({ name, link }) => (
              <li key={name}>
                <Link to={link}>{name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="right">
          <div className={`search ${showSearch ? "show-search" : ""}`}>


            <input
              type="text"
              placeholder="Search"
              onMouseEnter={() => setInputHover(true)}
              onMouseLeave={() => setInputHover(false)}
              onBlur={() => {
                setShoweSearch(false);
                setInputHover(false);
              }}
            />
            <button
              onClick={() => setShoweSearch(true)}
              onBlur={() => {
                if (!inputHover) setShoweSearch(false);
              }}
            >
              <FaSearch />
            </button>
          </div>

          <button onClick={handleLogout}>
            <FaPowerOff />
          </button>
        </div>
      </nav>
    </Container>
  );
};


const Container = styled.div`
  position: relative;
  z-index: 9999;

  /* =========================================
     NAVBAR
  ========================================= */

  nav {
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 72px;

    padding: 0 clamp(1rem, 4vw, 3rem);

    display: flex;
    align-items: center;
    justify-content: space-between;

    box-sizing: border-box;

    background: rgba(10, 10, 10, 0.75);

    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    transition: all 0.3s ease;

    z-index: 9999;
  }

  nav.scrolled {
    background: rgba(20, 20, 20, 0.96);

    box-shadow:
      0 3px 15px rgba(0, 0, 0, 0.5);
  }

  /* =========================================
     LEFT SIDE
  ========================================= */

  .left {
    display: flex;
    align-items: center;

    height: 100%;

    gap: clamp(1rem, 2.5vw, 2.5rem);

    min-width: 0;
  }

  /* =========================================
     LOGO
  ========================================= */

  .brand {
    width: clamp(80px, 8vw, 120px);
    height: 60px;

    display: flex;
    align-items: center;
    justify-content: center;

    overflow: hidden;

    flex-shrink: 0;
  }

  .brand img {
    display: block;

    width: clamp(78px, 7.7vw, 115px);
    height: auto;
    max-height: 58px;

    object-fit: contain;
    object-position: center;

    cursor: pointer;

    transition: transform 0.25s ease;
  }

  .brand img:hover {
    transform: scale(1.04);
  }

  /* =========================================
     NAVIGATION LINKS
  ========================================= */

  .links {
    display: flex;
    align-items: center;

    gap: clamp(0.8rem, 2vw, 2rem);

    margin: 0;
    padding: 0;

    list-style: none;

    min-width: 0;
  }

  .links li {
    display: flex;
    align-items: center;
  }

  .links a {
    position: relative;

    color: #ddd;

    text-decoration: none;

    font-size: clamp(0.82rem, 1vw, 1rem);
    font-weight: 600;

    white-space: nowrap;

    transition: color 0.25s ease;
  }

  .links a:hover {
    color: #fff;
  }

  .links a::after {
    content: "";

    position: absolute;

    left: 0;
    bottom: -7px;

    width: 0;
    height: 2px;

    background: #46d369;

    transition: width 0.25s ease;
  }

  .links a:hover::after {
    width: 100%;
  }

  /* =========================================
     RIGHT SIDE
  ========================================= */

  .right {
    display: flex;
    align-items: center;

    gap: clamp(0.25rem, 0.7vw, 0.7rem);

    flex-shrink: 0;
  }

  .right > button {
    width: clamp(34px, 3vw, 40px);
    height: clamp(34px, 3vw, 40px);

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: none;
    border-radius: 50%;

    background: transparent;

    color: white;

    font-size: clamp(0.95rem, 1.2vw, 1.15rem);

    cursor: pointer;

    transition: all 0.25s ease;
  }

  .right > button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #46d369;
  }

  /* =========================================
     SEARCH
  ========================================= */

  .search {
    display: flex;
    align-items: center;

    width: 40px;
    height: 38px;

    overflow: hidden;

    border: 1px solid transparent;
    border-radius: 5px;

    background: transparent;

    transition:
      width 0.3s ease,
      background 0.3s ease,
      border-color 0.3s ease;
  }

  .search.show-search {
    width: clamp(150px, 20vw, 230px);

    background: rgba(0, 0, 0, 0.75);

    border-color: rgba(255, 255, 255, 0.35);
  }

  .search input {
    width: 0;
    height: 100%;

    padding: 0;

    border: none;
    outline: none;

    background: transparent;

    color: white;

    font-size: clamp(0.8rem, 1vw, 0.9rem);

    transition: width 0.3s ease;

    min-width: 0;
  }

  .search.show-search input {
    width: 100%;

    padding: 0 10px;
  }

  .search input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .search button {
    width: 40px;
    min-width: 40px;
    height: 38px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: none;

    background: transparent;

    color: white;

    cursor: pointer;

    flex-shrink: 0;
  }

  .search button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* =========================================
     LARGE DESKTOP
  ========================================= */

  @media (min-width: 1440px) {
    nav {
      height: 76px;
    }

    .links {
      gap: 2.3rem;
    }

    .links a {
      font-size: 1.05rem;
    }
  }

  /* =========================================
     LAPTOP
  ========================================= */

  @media (max-width: 1200px) {
    nav {
      padding: 0 2rem;
    }

    .left {
      gap: 1.5rem;
    }

    .links {
      gap: 1.2rem;
    }
  }

  /* =========================================
     TABLET
  ========================================= */

  @media (max-width: 1024px) {
    nav {
      height: 68px;

      padding: 0 1.5rem;
    }

    .brand {
      width: 100px;
    }

    .brand img {
      width: 96px;
    }

    .left {
      gap: 1.2rem;
    }

    .links {
      gap: 0.9rem;
    }

    .links a {
      font-size: 0.85rem;
    }

    .search.show-search {
      width: 190px;
    }
  }

  /* =========================================
     SMALL TABLET
  ========================================= */

  @media (max-width: 850px) {
    nav {
      padding: 0 1.2rem;
    }

    .left {
      gap: 0.8rem;
    }

    .links {
      gap: 0.65rem;
    }

    .links a {
      font-size: 0.78rem;
    }

    .brand {
      width: 90px;
    }

    .brand img {
      width: 88px;
    }
  }

  /* =========================================
     MOBILE
  ========================================= */

  @media (max-width: 768px) {
    nav {
      height: 62px;

      padding: 0 0.9rem;
    }

    .brand {
      width: 88px;
      height: 52px;
    }

    .brand img {
      width: 86px;
      max-height: 48px;
    }

    /*
      Hide desktop navigation.
      You can replace this with a hamburger menu
      if you have one.
    */

    .links {
      display: none;
    }

    .right {
      gap: 0.25rem;
    }

    .right > button {
      width: 36px;
      height: 36px;
    }

    .search.show-search {
      width: min(52vw, 200px);
    }

    .search {
      height: 36px;
    }

    .search button {
      width: 36px;
      min-width: 36px;
      height: 36px;
    }
  }

  /* =========================================
     SMALL MOBILE
  ========================================= */

  @media (max-width: 480px) {
    nav {
      height: 58px;

      padding: 0 0.65rem;
    }

    .brand {
      width: 78px;
      height: 48px;
    }

    .brand img {
      width: 76px;
      max-height: 44px;
    }

    .right {
      gap: 0.15rem;
    }

    .right > button {
      width: 34px;
      height: 34px;
    }

    .search.show-search {
      width: 48vw;
      max-width: 170px;
    }

    .search input {
      font-size: 0.78rem;
    }

    .search button {
      width: 34px;
      min-width: 34px;
      height: 34px;
    }
  }

  /* =========================================
     VERY SMALL PHONES
  ========================================= */

  @media (max-width: 360px) {
    nav {
      padding: 0 0.45rem;
    }

    .brand {
      width: 70px;
    }

    .brand img {
      width: 68px;
    }

    .right > button {
      width: 32px;
      height: 32px;
    }

    .search.show-search {
      width: 45vw;
      max-width: 145px;
    }

    .search button {
      width: 32px;
      min-width: 32px;
    }
  }
`;