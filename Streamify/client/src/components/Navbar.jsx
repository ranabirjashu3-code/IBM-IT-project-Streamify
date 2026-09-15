import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import logo from "../assets/logo.png";
import { FaPowerOff, FaUser, FaCog, FaSignInAlt, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

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
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

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
            <img src={logo} alt="logo" onClick={() => navigate("/")} />
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

          <div className="profile-container"   ref={profileRef}>

            <button
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                />
              ) : (
                <span>
                  {user?.displayName
                    ? user.displayName.charAt(0).toUpperCase()
                    : user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </button>

            {showProfileMenu && (
              <div className="profile-menu">

                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/profile");
                      }}
                    >
                      <FaUser />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/settings");
                      }}
                    >
                      <FaCog />
                      <span>Settings</span>
                    </button>

                    <div className="menu-divider"></div>

                    <button
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
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/login");
                      }}
                    >
                      <FaSignInAlt />
                      <span>Login</span>
                    </button>

                    <button
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
  /* ========================================
   PROFILE
======================================== */

.profile-container {
  position: relative;

  display: flex;
  align-items: center;

  z-index: 10000;
}

/* ========================================
   PROFILE AVATAR
======================================== */

.profile-button {
  width: 42px;
  height: 42px;

  padding: 0;
  margin: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;

  background: linear-gradient(
    145deg,
    #3a3a3a,
    #222
  );

  color: #fff;

  cursor: pointer;

  overflow: hidden;

  outline: none;

  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

/* Avatar hover */

.profile-button:hover {
  transform: scale(1.08);

  border-color: rgba(255, 255, 255, 0.6);

  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.08),
    0 6px 18px rgba(0, 0, 0, 0.5);
}

/* Avatar click */

.profile-button:active {
  transform: scale(0.96);
}

/* ========================================
   PROFILE IMAGE
======================================== */

.profile-button img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;

  border-radius: 50%;
}

/* ========================================
   PROFILE LETTER
======================================== */

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

/* ========================================
   DROPDOWN MENU
======================================== */

.profile-menu {
  position: absolute;

  top: calc(100% + 12px);
  right: 0;

  width: 210px;

  padding: 8px;

  background: rgba(24, 24, 24, 0.98);

  border: 1px solid rgba(255, 255, 255, 0.1);

  border-radius: 10px;

  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.7),
    0 5px 15px rgba(0, 0, 0, 0.35);

  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);

  z-index: 99999;

  animation: profileDropdown 0.2s ease-out;
}

/* ========================================
   DROPDOWN ANIMATION
======================================== */

@keyframes profileDropdown {
  from {
    opacity: 0;

    transform:
      translateY(-8px)
      scale(0.96);
  }

  to {
    opacity: 1;

    transform:
      translateY(0)
      scale(1);
  }
}

/* ========================================
   MENU BUTTONS
======================================== */

.profile-menu button {
  width: 100%;

  min-height: 44px;

  display: flex;
  align-items: center;

  gap: 13px;

  padding: 10px 12px;

  margin: 0;

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

/* Icons */

.profile-menu button svg {
  width: 17px;
  min-width: 17px;

  font-size: 15px;

  color: #aaa;

  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

/* Hover */

.profile-menu button:hover {
  background: rgba(255, 255, 255, 0.08);

  color: #fff;

  transform: translateX(2px);
}

.profile-menu button:hover svg {
  color: #fff;

  transform: scale(1.08);
}

/* ========================================
   DIVIDER
======================================== */

.menu-divider {
  width: calc(100% - 8px);

  height: 1px;

  margin: 7px 4px;

  background: rgba(255, 255, 255, 0.1);
}

/* ========================================
   LOGOUT
======================================== */

.profile-menu .logout {
  color: #ff5a5a;
}

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

/* ========================================
   MOBILE
======================================== */

@media (max-width: 768px) {
  .profile-button {
    width: 38px;
    height: 38px;
  }

  .profile-button span {
    font-size: 15px;
  }

  .profile-menu {
    width: 190px;

    top: calc(100% + 10px);
  }

  .profile-menu button {
    min-height: 42px;

    font-size: 13px;
  }
}

/* ========================================
   SMALL MOBILE
======================================== */

@media (max-width: 480px) {
  .profile-button {
    width: 36px;
    height: 36px;
  }

  .profile-menu {
    width: 180px;

    right: -5px;
  }
}
`;