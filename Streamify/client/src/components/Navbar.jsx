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

  /* =====================================================
     NAVBAR
  ===================================================== */

  nav {
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 72px;

    display: flex;
    align-items: center;

    padding: 0 clamp(16px, 3vw, 48px);

    box-sizing: border-box;

    background: rgba(10, 10, 10, 0.82);

    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);

    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    z-index: 9999;

    transition:
      background 0.3s ease,
      box-shadow 0.3s ease,
      height 0.3s ease;
  }

  /* =====================================================
     SCROLLED NAVBAR
  ===================================================== */

  nav.scrolled {
    background: rgba(10, 10, 10, 0.96);

    box-shadow:
      0 4px 25px rgba(0, 0, 0, 0.45);
  }

  /* =====================================================
     LEFT SECTION
  ===================================================== */

  .left {
    display: flex;
    align-items: center;

    height: 100%;

    gap: clamp(18px, 2.5vw, 40px);

    flex: 1 1 auto;

    min-width: 0;
  }

  /* =====================================================
     LOGO
  ===================================================== */

  .brand {
    width: clamp(82px, 8vw, 120px);
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    overflow: hidden;
  }

  .brand img {
    display: block;

    width: clamp(78px, 7.5vw, 115px);
    max-height: 58px;

    height: auto;

    object-fit: contain;
    object-position: center;

    cursor: pointer;

    transition:
      transform 0.25s ease,
      opacity 0.25s ease;
  }

  .brand img:hover {
    transform: scale(1.04);
    opacity: 0.95;
  }

  /* =====================================================
     NAVIGATION LINKS
  ===================================================== */

  .links {
    display: flex;
    align-items: center;

    gap: clamp(14px, 1.8vw, 32px);

    margin: 0;
    padding: 0;

    list-style: none;

    white-space: nowrap;

    flex: 0 1 auto;

    min-width: 0;
  }

  .links li {
    display: flex;
    align-items: center;

    flex-shrink: 0;
  }

  .links a {
    position: relative;

    display: inline-flex;
    align-items: center;

    color: rgba(255, 255, 255, 0.78);

    text-decoration: none;

    font-size: clamp(13px, 1vw, 16px);

    font-weight: 600;

    line-height: 1;

    white-space: nowrap;

    padding: 10px 0;

    transition:
      color 0.25s ease,
      transform 0.25s ease;
  }

  .links a:hover {
    color: #ffffff;
  }

  /* Active / hover underline */

  .links a::after {
    content: "";

    position: absolute;

    left: 0;
    bottom: 1px;

    width: 0;
    height: 2px;

    border-radius: 10px;

    background: #46d369;

    transition: width 0.25s ease;
  }

  .links a:hover::after {
    width: 100%;
  }

  /* =====================================================
     RIGHT SECTION
  ===================================================== */

  .right {
    display: flex;
    align-items: center;

    gap: 8px;

    flex-shrink: 0;

    margin-left: clamp(16px, 2vw, 32px);
  }

  /* =====================================================
     RIGHT ICON BUTTONS
  ===================================================== */

  .right > button {
    width: 40px;
    height: 40px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: none;
    border-radius: 50%;

    background: transparent;

    color: rgba(255, 255, 255, 0.9);

    font-size: 18px;

    cursor: pointer;

    flex-shrink: 0;

    transition:
      background 0.25s ease,
      color 0.25s ease,
      transform 0.25s ease;
  }

  .right > button:hover {
    background: rgba(255, 255, 255, 0.1);

    color: #46d369;

    transform: scale(1.05);
  }

  /* =====================================================
     SEARCH
  ===================================================== */

  .search {
    display: flex;
    align-items: center;

    width: 40px;
    height: 38px;

    overflow: hidden;

    border: 1px solid transparent;

    border-radius: 6px;

    background: transparent;

    flex-shrink: 0;

    transition:
      width 0.3s ease,
      background 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  .search.show-search {
    width: clamp(170px, 18vw, 240px);

    background: rgba(0, 0, 0, 0.75);

    border-color: rgba(255, 255, 255, 0.2);

    box-shadow:
      0 4px 15px rgba(0, 0, 0, 0.25);
  }

  .search input {
    width: 0;
    height: 100%;

    min-width: 0;

    padding: 0;

    border: none;
    outline: none;

    background: transparent;

    color: #ffffff;

    font-size: 14px;

    transition:
      width 0.3s ease,
      padding 0.3s ease;
  }

  .search.show-search input {
    width: 100%;

    padding: 0 10px;
  }

  .search input::placeholder {
    color: rgba(255, 255, 255, 0.55);
  }

  .search button {
    width: 40px;
    min-width: 40px;
    height: 38px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: none;

    background: transparent;

    color: #ffffff;

    cursor: pointer;

    flex-shrink: 0;

    transition:
      background 0.25s ease,
      color 0.25s ease;
  }

  .search button:hover {
    background: rgba(255, 255, 255, 0.08);

    color: #46d369;
  }

  /* =====================================================
     LARGE DESKTOP
     1440px+
  ===================================================== */

  @media (min-width: 1440px) {
    nav {
      height: 76px;
    }

    .links {
      gap: 34px;
    }

    .links a {
      font-size: 16px;
    }

    .right {
      gap: 10px;
    }
  }

  /* =====================================================
     DESKTOP / LAPTOP
     1200px
  ===================================================== */

  @media (max-width: 1200px) {
    nav {
      padding: 0 28px;
    }

    .left {
      gap: 24px;
    }

    .links {
      gap: 20px;
    }

    .links a {
      font-size: 14px;
    }

    .search.show-search {
      width: 200px;
    }
  }

  /* =====================================================
     TABLET
     1024px
  ===================================================== */

  @media (max-width: 1024px) {
    nav {
      height: 66px;

      padding: 0 20px;
    }

    .left {
      gap: 18px;
    }

    .brand {
      width: 92px;
    }

    .brand img {
      width: 88px;
    }

    .links {
      gap: 14px;
    }

    .links a {
      font-size: 13px;
    }

    .right {
      gap: 5px;

      margin-left: 16px;
    }

    .right > button {
      width: 36px;
      height: 36px;

      font-size: 16px;
    }

    .search.show-search {
      width: 170px;
    }
  }

  /* =====================================================
     SMALL TABLET
     850px
  ===================================================== */

  @media (max-width: 850px) {
    nav {
      padding: 0 14px;
    }

    .left {
      gap: 14px;
    }

    .brand {
      width: 78px;
    }

    .brand img {
      width: 76px;
    }

    .links {
      gap: 11px;
    }

    .links a {
      font-size: 12px;
    }

    .right {
      margin-left: 12px;
    }

    .search.show-search {
      width: 150px;
    }
  }

  /* =====================================================
     MOBILE
     768px
  ===================================================== */

  @media (max-width: 768px) {
    nav {
      height: 60px;

      padding: 0 12px;

      /*
        Keep everything accessible.
        The navbar can scroll horizontally if needed.
      */
      overflow-x: auto;
      overflow-y: hidden;

      justify-content: flex-start;

      -webkit-overflow-scrolling: touch;

      scrollbar-width: none;
    }

    nav::-webkit-scrollbar {
      display: none;
    }

    .left {
      flex: 0 0 auto;

      gap: 12px;
    }

    .brand {
      width: 76px;
      height: 54px;
    }

    .brand img {
      width: 74px;
      max-height: 46px;
    }

    .links {
      display: flex;

      gap: 12px;

      flex: 0 0 auto;
    }

    .links a {
      font-size: 12px;

      padding: 8px 0;
    }

    .right {
      flex: 0 0 auto;

      margin-left: 14px;

      gap: 4px;
    }

    .right > button {
      width: 34px;
      height: 34px;

      font-size: 15px;
    }

    .search {
      width: 34px;
      height: 34px;
    }

    .search.show-search {
      width: 145px;
    }

    .search button {
      width: 34px;
      min-width: 34px;
      height: 34px;
    }
  }

  /* =====================================================
     MOBILE
     600px
  ===================================================== */

  @media (max-width: 600px) {
    nav {
      padding: 0 10px;
    }

    .left {
      gap: 10px;
    }

    .brand {
      width: 68px;
    }

    .brand img {
      width: 66px;
    }

    .links {
      gap: 10px;
    }

    .links a {
      font-size: 11px;
    }

    .right {
      margin-left: 12px;
    }

    .right > button {
      width: 32px;
      height: 32px;

      font-size: 14px;
    }

    .search {
      width: 32px;
      height: 32px;
    }

    .search.show-search {
      width: 130px;
    }

    .search button {
      width: 32px;
      min-width: 32px;
      height: 32px;
    }
  }

  /* =====================================================
     SMALL MOBILE
     480px
  ===================================================== */

  @media (max-width: 480px) {
    nav {
      height: 56px;

      padding: 0 8px;
    }

    .left {
      gap: 8px;
    }

    .brand {
      width: 62px;
      height: 50px;
    }

    .brand img {
      width: 60px;
      max-height: 42px;
    }

    .links {
      gap: 9px;
    }

    .links a {
      font-size: 10.5px;
    }

    .right {
      margin-left: 10px;

      gap: 3px;
    }

    .right > button {
      width: 30px;
      height: 30px;

      font-size: 13px;
    }

    .search {
      width: 30px;
      height: 30px;
    }

    .search.show-search {
      width: 120px;
    }

    .search button {
      width: 30px;
      min-width: 30px;
      height: 30px;
    }

    .search input {
      font-size: 12px;
    }
  }

  /* =====================================================
     VERY SMALL PHONES
     360px
  ===================================================== */

  @media (max-width: 360px) {
    nav {
      padding: 0 6px;
    }

    .left {
      gap: 7px;
    }

    .brand {
      width: 56px;
    }

    .brand img {
      width: 54px;
    }

    .links {
      gap: 8px;
    }

    .links a {
      font-size: 10px;
    }

    .right {
      margin-left: 8px;
    }

    .right > button {
      width: 28px;
      height: 28px;

      font-size: 12px;
    }

    .search {
      width: 28px;
      height: 28px;
    }

    .search.show-search {
      width: 110px;
    }

    .search button {
      width: 28px;
      min-width: 28px;
      height: 28px;
    }
  }
`;