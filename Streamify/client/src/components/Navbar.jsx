import React, { useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import logo from "../assets/logo.png";
import { FaPowerOff, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";

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

  nav {
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 72px;

    padding: 0 3rem;

    display: flex;
    align-items: center;
    justify-content: space-between;

    background: rgba(10, 10, 10, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    transition: all 0.3s ease;

    z-index: 9999;
  }

  nav.scrolled {
    background: rgba(20, 20, 20, 0.96);
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.5);
  }

  /* LEFT */
  .left {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 2.5rem;
  }

  /* LOGO */
  .brand {
    width: 120px;
    height: 60px;

    display: flex;
    align-items: center;
    justify-content: center;

    overflow: hidden;
    flex-shrink: 0;
  }

  .brand img {
    display: block;

    width: 115px;
    height: 58px;

    object-fit: contain;
    object-position: center;

    cursor: pointer;

    transition: transform 0.25s ease;
  }

  .brand img:hover {
    transform: scale(1.04);
  }

  /* NAV LINKS */
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

    color: #ddd;

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
    bottom: -7px;

    width: 0;
    height: 2px;

    background: #46d369;

    transition: width 0.25s ease;
  }

  .links a:hover::after {
    width: 100%;
  }

  /* RIGHT */
  .right {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

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

    color: white;

    font-size: 1.15rem;

    cursor: pointer;

    transition: all 0.25s ease;
  }

  .right > button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #46d369;
  }

  /* SEARCH */
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
    width: 230px;

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

    font-size: 0.9rem;

    transition: width 0.3s ease;
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
  }

  .search button:hover {
    background: rgba(255, 255, 255, 0.1);
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
  }

  /* MOBILE */
  @media (max-width: 768px) {
    nav {
      height: 62px;
      padding: 0 1rem;
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
      gap: 0.3rem;
    }

    .search.show-search {
      width: 180px;
    }
  }
`;