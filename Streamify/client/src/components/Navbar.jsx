import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import logo from "../assets/logo.png";
import {
  FaPowerOff,
  FaUser,
  FaCog,
  FaSignInAlt,
  FaSearch,
  FaBookmark,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../Utils/firebase-config";

export default function Navbar({ isScrolled }) {
  const links = [
    { name: "Home", link: "/" },
    { name: "Movies", link: "/movies" },
    { name: "TV Shows", link: "/tv" },
    { name: "Anime", link: "/anime" },
  ];

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigate = useNavigate();

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Open the Search page.
  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (query) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    } else {
      navigate("/search");
    }

    setSearchQuery("");
    setShowSearch(false);
  };

  // Firebase authentication listener.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  // Close profile menu when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Close the expanded Navbar search when clicking outside.
  useEffect(() => {
    const handleSearchClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleSearchClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleSearchClickOutside
      );
    };
  }, []);

  // Logout.
  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      toast.success("Logout Successful");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <Container>
      <nav className={isScrolled ? "scrolled" : ""}>
        {/* LEFT SECTION */}
        <div className="left">
          <div className="brand">
            <img
              src={logo}
              alt="Streamify logo"
              onClick={() => navigate("/")}
            />
          </div>

          {/* DESKTOP NAVIGATION */}
          <ul className="links">
            {links.map(({ name, link }) => (
              <li key={name}>
                <Link to={link}>{name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT SECTION */}
        <div className="right">
          {/* SEARCH */}
          <div
            className={`search ${
              showSearch ? "show-search" : ""
            }`}
            ref={searchRef}
          >
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              onFocus={() => setShowSearch(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(e);
                }

                if (e.key === "Escape") {
                  setShowSearch(false);
                  setSearchQuery("");
                }
              }}
              aria-label="Search movies and TV shows"
            />

            <button
              type="button"
              aria-label="Open search page"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setSearchQuery("");
                setShowSearch(false);
                navigate("/search");
              }}
            >
              <FaSearch />
            </button>
          </div>

          {/* PROFILE */}
          <div
            className="profile-container"
            ref={profileRef}
          >
            <button
              type="button"
              className="profile-button"
              aria-label="Open profile menu"
              onClick={() =>
                setShowProfileMenu((previous) => !previous)
              }
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" />
              ) : (
                <span>
                  {user?.displayName
                    ? user.displayName
                        .charAt(0)
                        .toUpperCase()
                    : user?.email?.charAt(0).toUpperCase() ||
                      "U"}
                </span>
              )}
            </button>

            {/* PROFILE DROPDOWN */}
            {showProfileMenu && (
              <div className="profile-menu">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/profile");
                      }}
                    >
                      <FaUser />
                      <span>Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/watchlist");
                      }}
                    >
                      <FaBookmark />
                      <span>Watchlist</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/settings");
                      }}
                    >
                      <FaCog />
                      <span>Settings</span>
                    </button>

                    <div className="menu-divider" />

                    <button
                      type="button"
                      className="logout"
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                    >
                      <FaPowerOff />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/login");
                      }}
                    >
                      <FaSignInAlt />
                      <span>Login</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/signup");
                      }}
                    >
                      <FaUser />
                      <span>Sign Up</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => {
              setShowMobileMenu((previous) => !previous);
              setShowProfileMenu(false);
            }}
            aria-label="Toggle navigation menu"
          >
            {showMobileMenu ? "✕" : "☰"}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        <ul
          className={`mobile-links ${
            showMobileMenu ? "mobile-open" : ""
          }`}
        >
          {links.map(({ name, link }) => (
            <li key={name}>
              <Link
                to={link}
                onClick={() => setShowMobileMenu(false)}
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  width: 100%;
  z-index: 9999;

  nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 72px;
    padding: 0 3rem;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(10, 10, 10, 0.78);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    z-index: 9999;
    transition:
      background 0.3s ease,
      box-shadow 0.3s ease,
      border-color 0.3s ease;
  }

  nav.scrolled {
    background: rgba(15, 15, 15, 0.97);
    border-bottom-color: rgba(255, 255, 255, 0.07);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
  }

  /* LEFT SECTION */
  .left {
    height: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 2.5rem;
    flex: 1;
  }

  /* LOGO */
  .brand {
    width: 120px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }

  .brand img {
    display: block;
    width: 115px;
    height: 58px;
    object-fit: contain;
    object-position: center;
    cursor: pointer;
    user-select: none;
    transition:
      transform 0.25s ease,
      filter 0.25s ease;
  }

  .brand img:hover {
    transform: scale(1.04);
    filter: drop-shadow(
      0 4px 10px rgba(70, 211, 105, 0.15)
    );
  }

  /* DESKTOP LINKS */
  .links {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .links li {
    display: flex;
    align-items: center;
  }

  .links a {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 72px;
    color: #d6d6d6;
    text-decoration: none;
    font-size: 1rem;
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
    bottom: 16px;
    width: 0;
    height: 2px;
    border-radius: 10px;
    background: #46d369;
    transition: width 0.25s ease;
  }

  .links a:hover::after {
    width: 100%;
  }

  /* RIGHT SECTION */
  .right {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-shrink: 0;
  }

  .right > button {
    width: 40px;
    height: 40px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: #fff;
    font-size: 1.15rem;
    cursor: pointer;
    outline: none;
    transition:
      background 0.25s ease,
      color 0.25s ease,
      transform 0.2s ease;
  }

  .right > button:hover {
    background: rgba(255, 255, 255, 0.09);
    color: #46d369;
  }

  .right > button:active {
    transform: scale(0.93);
  }

  /* NAVBAR SEARCH */
  .search {
    position: relative;
    width: 40px;
    height: 38px;
    display: flex;
    align-items: center;
    overflow: visible;
    box-sizing: border-box;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    transition:
      width 0.3s ease,
      background 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  .search.show-search {
    width: 230px;
    background: rgba(0, 0, 0, 0.72);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
  }

  .search input {
    flex: 1;
    width: 0;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    color: #fff;
    font-family: inherit;
    font-size: 0.9rem;
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
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: #fff;
    cursor: pointer;
    outline: none;
    transition:
      background 0.2s ease,
      color 0.2s ease;
  }

  .search button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #46d369;
  }

  /* PROFILE */
  .profile-container {
    position: relative;
    display: flex;
    align-items: center;
    z-index: 10000;
  }

  .profile-button {
    width: 42px;
    height: 42px;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border: 2px solid rgba(255, 255, 255, 0.18);
    border-radius: 50%;
    background: linear-gradient(145deg, #3a3a3a, #222);
    color: #fff;
    cursor: pointer;
    overflow: hidden;
    outline: none;
    transition:
      transform 0.25s ease,
      border-color 0.25s ease,
      box-shadow 0.25s ease;
  }

  .profile-button:hover {
    transform: scale(1.07);
    border-color: rgba(255, 255, 255, 0.55);
    box-shadow:
      0 0 0 3px rgba(255, 255, 255, 0.07),
      0 6px 18px rgba(0, 0, 0, 0.45);
  }

  .profile-button:active {
    transform: scale(0.95);
  }

  .profile-button img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .profile-button span {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-family: Arial, sans-serif;
    font-size: 17px;
    font-weight: 700;
    text-transform: uppercase;
    user-select: none;
  }

  /* PROFILE DROPDOWN */
  .profile-menu {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    width: 210px;
    padding: 8px;
    box-sizing: border-box;
    background: rgba(24, 24, 24, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    box-shadow:
      0 18px 45px rgba(0, 0, 0, 0.7),
      0 5px 15px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    z-index: 99999;
    animation: profileDropdown 0.2s ease-out;
  }

  @keyframes profileDropdown {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.96);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .profile-menu button {
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 13px;
    border: none;
    border-radius: 7px;
    background: transparent;
    color: #d6d6d6;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    outline: none;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      transform 0.2s ease;
  }

  .profile-menu button svg {
    width: 17px;
    min-width: 17px;
    font-size: 15px;
    color: #aaa;
    transition:
      color 0.2s ease,
      transform 0.2s ease;
  }

  .profile-menu button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    transform: translateX(2px);
  }

  .profile-menu button:hover svg {
    color: #fff;
    transform: scale(1.08);
  }

  .menu-divider {
    width: calc(100% - 8px);
    height: 1px;
    margin: 7px 4px;
    background: rgba(255, 255, 255, 0.1);
  }

  .profile-menu .logout,
  .profile-menu .logout svg {
    color: #ff5a5a;
  }

  .profile-menu .logout:hover {
    background: rgba(229, 9, 20, 0.12);
    color: #ff3333;
  }

  .profile-menu .logout:hover svg {
    color: #ff3333;
  }

  /* MOBILE MENU BUTTON */
  .mobile-menu-button {
    display: none;
    width: 40px;
    height: 40px;
    padding: 0;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    font-size: 1.35rem;
    cursor: pointer;
    outline: none;
    transition:
      background 0.25s ease,
      color 0.25s ease,
      transform 0.2s ease;
  }

  .mobile-menu-button:hover {
    background: rgba(255, 255, 255, 0.14);
    color: #46d369;
  }

  .mobile-menu-button:active {
    transform: scale(0.92);
  }

  .mobile-links {
    display: none;
  }

  /* TABLET */
  @media (max-width: 1024px) {
    nav {
      padding: 0 1.5rem;
    }

    .left {
      gap: 1.5rem;
    }

    .links {
      gap: 1.2rem;
    }

    .brand {
      width: 105px;
    }

    .brand img {
      width: 100px;
    }

    .links a {
      font-size: 0.9rem;
    }

    .search.show-search {
      width: 200px;
    }
  }

  /* MOBILE */
  @media (max-width: 768px) {
    nav {
      height: 62px;
      padding: 0 1rem;
    }

    .left {
      gap: 0;
      flex: 1;
    }

    .brand {
      width: 90px;
      height: 52px;
    }

    .brand img {
      width: 88px;
      height: 48px;
    }

    .links {
      display: none;
    }

    .right {
      gap: 0.35rem;
    }

    .search {
      width: 40px;
      height: 38px;
    }

    .search.show-search {
      width: 180px;
    }

    .profile-button {
      width: 38px;
      height: 38px;
    }

    .profile-button span {
      font-size: 15px;
    }

    .mobile-menu-button {
      display: flex;
    }

    .profile-menu {
      width: 190px;
      top: calc(100% + 10px);
    }

    .profile-menu button {
      min-height: 42px;
      font-size: 13px;
    }

    .mobile-links {
      position: absolute;
      top: 62px;
      left: 0;
      width: 100%;
      margin: 0;
      padding: 0.5rem 0;
      box-sizing: border-box;
      display: none;
      flex-direction: column;
      list-style: none;
      background: rgba(15, 15, 15, 0.98);
      border-top: 1px solid rgba(255, 255, 255, 0.07);
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      z-index: 9998;
    }

    .mobile-links.mobile-open {
      display: flex;
      animation: mobileMenuOpen 0.25s ease-out;
    }

    .mobile-links li {
      width: 100%;
    }

    .mobile-links a {
      width: 100%;
      min-height: 52px;
      padding: 0 1.5rem;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      color: #ddd;
      text-decoration: none;
      font-size: 1rem;
      font-weight: 600;
      transition:
        background 0.2s ease,
        color 0.2s ease,
        padding-left 0.2s ease;
    }

    .mobile-links a:hover {
      background: rgba(255, 255, 255, 0.07);
      color: #fff;
      padding-left: 1.8rem;
    }

    .mobile-links a:active {
      background: rgba(70, 211, 105, 0.1);
      color: #46d369;
    }

    @keyframes mobileMenuOpen {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  /* SMALL MOBILE */
  @media (max-width: 480px) {
    nav {
      height: 60px;
      padding: 0 0.7rem;
    }

    .brand {
      width: 82px;
      height: 50px;
    }

    .brand img {
      width: 80px;
      height: 46px;
    }

    .right {
      gap: 0.15rem;
    }

    .search.show-search {
      width: 150px;
    }

    .profile-button {
      width: 36px;
      height: 36px;
    }

    .mobile-menu-button {
      width: 36px;
      height: 36px;
      font-size: 1.2rem;
    }

    .profile-menu {
      width: 180px;
      right: -5px;
    }

    .mobile-links {
      top: 60px;
    }

    .mobile-links a {
      min-height: 50px;
      padding: 0 1.25rem;
      font-size: 0.95rem;
    }

    .mobile-links a:hover {
      padding-left: 1.5rem;
    }
  }

  /* VERY SMALL PHONES */
  @media (max-width: 360px) {
    nav {
      padding: 0 0.5rem;
    }

    .brand {
      width: 76px;
    }

    .brand img {
      width: 74px;
    }

    .right {
      gap: 0.1rem;
    }

    .search.show-search {
      width: 135px;
    }

    .mobile-menu-button {
      width: 34px;
      height: 34px;
    }

    .profile-button {
      width: 34px;
      height: 34px;
    }
  }

  /* REDUCED MOTION */
  @media (prefers-reduced-motion: reduce) {
    nav,
    .brand img,
    .links a,
    .search,
    .search input,
    .search button,
    .profile-button,
    .profile-menu button,
    .mobile-menu-button,
    .mobile-links a {
      transition: none;
    }

    .profile-menu,
    .mobile-links.mobile-open {
      animation: none;
    }
  }
`;