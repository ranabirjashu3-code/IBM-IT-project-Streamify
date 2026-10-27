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
justify-content: center;
gap: 1.8rem;
margin-bottom: 2.8rem;
}

  .social-icons svg {
    font-size: 1.9rem;
    color: #808080;
    cursor: pointer;

    transition:
      color 0.3s ease,
      transform 0.3s ease;
  }

  .social-icons svg:hover {
    color: #ffffff;
    transform: translateY(-4px) scale(1.15);
  }

  .links {
    display: grid;

    grid-template-columns:
      repeat(4, minmax(180px, 1fr));

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

    transition:
      color 0.25s ease,
      transform 0.25s ease;
  }

  li:hover {
    color: #ffffff;

    transform: translateX(5px);

    text-decoration: underline;
  }

  .service-btn {
    width: fit-content;

    padding:
      0.75rem
      1.5rem;

    background: transparent;

    border:
      1px solid
      #666;

    color: #808080;

    cursor: pointer;

    font-size: 0.95rem;

    transition:
      background 0.3s ease,
      color 0.3s ease,
      border-color 0.3s ease;

    margin-bottom: 2rem;
  }

  .service-btn:hover {
    background:
      rgba(255, 255, 255, 0.06);

    color: white;

    border-color: white;
  }

  .copyright {
    color: #666;

    font-size: 0.88rem;

    letter-spacing: 0.4px;
  }

  @media (max-width: 1200px) {
    padding:
      3rem
      4rem
      2rem;

    .links {
      grid-template-columns:
        repeat(2, 1fr);

      gap: 2rem;
    }
  }

  @media (max-width: 768px) {
    padding:
      2rem
      1.5rem;

    .social-icons {
      justify-content: center;

      gap: 1.5rem;

      margin-bottom: 2rem;
    }

    .social-icons svg {
      font-size: 1.7rem;
    }

    .links {
      grid-template-columns: 1fr;

      text-align: center;

      gap: 1.5rem;

      margin-bottom: 2rem;
    }

    li {
      margin-bottom: 0.75rem;
    }

    li:hover {
      transform: none;
    }

    .service-btn {
      margin:
        0
        auto
        2rem;
    }

    .copyright {
      text-align: center;

      font-size: 0.8rem;

      line-height: 1.5;
    }
  }

  @media (max-width: 480px) {
    padding:
      1.75rem
      1rem
      1.5rem;

    .social-icons {
      gap: 1.2rem;

      margin-bottom: 1.75rem;
    }

    .social-icons svg {
      font-size: 1.5rem;
    }

    .links {
      gap: 1.2rem;

      margin-bottom: 1.75rem;
    }

    li {
      font-size: 0.85rem;

      margin-bottom: 0.65rem;
    }

    .service-btn {
      padding:
        0.65rem
        1.2rem;

      font-size: 0.85rem;

      margin-bottom: 1.75rem;
    }

    .copyright {
      font-size: 0.75rem;

      letter-spacing: 0.2px;
    }
  }

  @media (max-width: 360px) {
    padding:
      1.5rem
      0.75rem
      1.25rem;

    .social-icons {
      gap: 1rem;

      margin-bottom: 1.5rem;
    }

    .social-icons svg {
      font-size: 1.4rem;
    }

    .links {
      gap: 1rem;
    }

    li {
      font-size: 0.8rem;
    }

    .service-btn {
      padding:
        0.6rem
        1rem;

      font-size: 0.8rem;
    }

    .copyright {
      font-size: 0.7rem;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    .social-icons svg:hover {
      color: #808080;

      transform: none;
    }

    li:hover {
      color: #8c8c8c;

      transform: none;

      text-decoration: none;
    }

    .service-btn:hover {
      background: transparent;

      color: #808080;

      border-color: #666;
    }
  }
`;

