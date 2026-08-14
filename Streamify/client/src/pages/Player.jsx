import React from "react";
import styled from "styled-components";
import { BsArrowLeft } from "react-icons/bs";
import video from "../assets/video.mp4";
import { useNavigate } from "react-router-dom";

export default function PlayerDemo() {
    const navigate = useNavigate();
    return <Container>
        <div className="player">
            <div className="back">
                <BsArrowLeft onClick={() => navigate(-1)} />
            </div>
            <video src={video} autoPlay loop controls></video>
        </div>
    </Container>
};


const Container = styled.div`
  width: 100%;
  height: 100vh;
  background: #000;
  overflow: hidden;

  .player {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .back {
    position: absolute;
    top: 1.8rem;
    left: 1.8rem;
    z-index: 100;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back svg {
    font-size: 2.2rem;
    color: #fff;
    transition: all 0.25s ease;
  }

  .back:hover svg {
    color: #e50914;
    transform: translateX(-5px);
  }

  .back:active svg {
    transform: scale(0.95);
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
    outline: none;
  }

  @media (max-width: 768px) {
    .back {
      top: 1rem;
      left: 1rem;
    }

    .back svg {
      font-size: 1.8rem;
    }
  }

  @media (max-width: 480px) {
    .back svg {
      font-size: 1.6rem;
    }
  }
`;