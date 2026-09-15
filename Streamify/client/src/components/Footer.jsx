import React from "react";
import styled from "styled-components";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <Container>
      <div className="social-icons">
        <FaFacebookF />
        <FaInstagram />
        <FaTwitter />
        <FaYoutube />
      </div>

      <div className="links">
        <ul>
          <li>Audio Description</li>
          <li>Investor Relations</li>
          <li>Legal Notices</li>
          <li>Help Center</li>
        </ul>

        <ul>
          <li>Jobs</li>
          <li>Cookie Preferences</li>
          <li>Corporate Information</li>
          <li>Contact Us</li>
        </ul>

        <ul>
          <li>Gift Cards</li>
          <li>Terms of Use</li>
          <li>Privacy</li>
          <li>FAQ</li>
        </ul>

        <ul>
          <li>Media Center</li>
          <li>Account</li>
          <li>Only on Streamify</li>
          <li>Support</li>
        </ul>
      </div>

      <button className="service-btn">Service Code</button>

      <p className="copyright">
        © 2026 Streamify, Inc. All rights reserved.
      </p>
    </Container>
  );
}



const Container = styled.footer`
  width: 100%;
  background: #141414;
  color: #808080;

  padding: 3rem 8rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  display: flex;
  flex-direction: column;

  .social-icons {
    display: flex;
    align-items: center;
    gap: 1.8rem;
    margin-bottom: 2.8rem;
  }

  .social-icons svg {
    font-size: 1.9rem;
    color: #808080;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .social-icons svg:hover {
    color: #ffffff;
    transform: translateY(-4px) scale(1.15);
  }

  .links {
    display: grid;
    grid-template-columns: repeat(4, minmax(180px, 1fr));
    gap: 3rem;
    margin-bottom: 2.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 1rem;
    font-size: 0.95rem;
    color: #8c8c8c;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  li:hover {
    color: #ffffff;
    transform: translateX(5px);
    text-decoration: underline;
  }

  .service-btn {
    width: fit-content;
    padding: 0.75rem 1.5rem;

    background: transparent;
    border: 1px solid #666;
    color: #808080;

    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.3s ease;

    margin-bottom: 2rem;
  }

  .service-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: white;
    border-color: white;
  }

  .copyright {
    color: #666;
    font-size: 0.88rem;
    letter-spacing: 0.4px;
  }

  @media (max-width: 1200px) {
    padding: 3rem 4rem 2rem;

    .links {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;

    .social-icons {
      justify-content: center;
      margin-bottom: 2rem;
    }

    .links {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 1.5rem;
    }

    li:hover {
      transform: none;
    }

    .service-btn {
      margin: 0 auto 2rem;
    }

    .copyright {
      text-align: center;
    }
  }
`;