import React, { useState } from "react";
import Card from "./Card";
import styled from "styled-components";
import { useRef } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

export default React.memo(function CardSlider({ data, title }) {
  const [showControls, setShowControls] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);

  const listRef = useRef(null);

  const cardWidth = 179; // card width + gap
  const visibleCards = 8;

  const handleDirection = (direction) => {
    if (!listRef.current) return;

    if (direction === "left" && sliderPosition > 0) {
      const newPosition = sliderPosition - 1;

      setSliderPosition(newPosition);

      listRef.current.style.transform = `translateX(-${
        newPosition * cardWidth
      }px)`;
    }

    if (
      direction === "right" &&
      sliderPosition < data.length - visibleCards
    ) {
      const newPosition = sliderPosition + 1;

      setSliderPosition(newPosition);

      listRef.current.style.transform = `translateX(-${
        newPosition * cardWidth
      }px)`;
    }
  };

  return (
    <Container
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <h2 className="title">{title}</h2>

      <div className="wrapper">
        <button
          className={`slider-action left ${!showControls ? "hide" : ""}`}
          onClick={() => handleDirection("left")}
        >
          <AiOutlineLeft />
        </button>

        <div className="slider-container">
          <div className="slider" ref={listRef}>
            {data?.map((movie) => (
              <Card
                key={movie.id}
                movieData={movie}
              />
            ))}
          </div>
        </div>

        <button
          className={`slider-action right ${!showControls ? "hide" : ""}`}
          onClick={() => handleDirection("right")}
        >
          <AiOutlineRight />
        </button>
      </div>
    </Container>
  );
})




const Container = styled.div`
  position: relative;
  margin: 0.15rem 0;
  overflow: visible;
  z-index: 1;

  &:hover {
    z-index: 99999;
  }

  .title {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.35rem 1.8rem;
    letter-spacing: 0.4px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .wrapper {
    position: relative;
    width: 100%;
    overflow: visible;
    z-index: 1;
  }

  .wrapper:hover {
    z-index: 99999;
  }

  .slider-container {
    position: relative;
    width: 100%;
    overflow: visible;
    padding: 0.3rem 1rem;
    touch-action: pan-x;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
  }

  .slider {
    display: flex;
    align-items: center;
    gap: 14px;
    width: max-content;
    transition: transform 0.55s ease;
    will-change: transform;
    overflow: visible;
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-x;
    cursor: grab;
  }

  .slider:active {
    cursor: grabbing;
  }

  .slider-action {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 52px;
    height: 52px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    border-radius: 50%;
    background: rgba(20, 20, 20, 0.75);
    color: #fff;
    cursor: pointer;
    z-index: 100000;
    transition:
      background 0.25s ease,
      color 0.25s ease,
      transform 0.25s ease;
    touch-action: manipulation;
  }

  .slider-action:hover {
    background: #fff;
    color: #000;
    transform: translateY(-50%) scale(1.08);
  }

  .slider-action svg {
    font-size: 1.8rem;
    transition: transform 0.25s ease;
  }

  .slider-action:hover svg {
    transform: scale(1.15);
  }

  .left {
    left: 8px;
  }

  .right {
    right: 8px;
  }

  .hide {
    opacity: 0;
    pointer-events: none;
  }

  @media (min-width: 1440px) {
    .title {
      font-size: 1.6rem;
      margin-left: 2rem;
    }

    .slider-container {
      padding: 0.4rem 1.2rem;
      overflow: visible;
    }

    .slider {
      gap: 16px;
      overflow: visible;
    }

    .slider-action {
      width: 54px;
      height: 54px;
    }

    .slider-action svg {
      font-size: 1.9rem;
    }

    .left {
      left: 10px;
    }

    .right {
      right: 10px;
    }
  }

  @media (max-width: 1024px) {
    .title {
      margin-left: 1.5rem;
      font-size: 1.3rem;
    }

    .slider-container {
      padding: 0.3rem 1rem;
      overflow: visible;
    }

    .slider {
      gap: 12px;
      overflow: visible;
    }

    .slider-action {
      width: 44px;
      height: 44px;
    }

    .slider-action svg {
      font-size: 1.5rem;
    }

    .left {
      left: 6px;
    }

    .right {
      right: 6px;
    }
  }

  @media (max-width: 768px) {
    margin: 0;

    .title {
      margin-left: 1rem;
      margin-bottom: 0.25rem;
      font-size: 1.1rem;
    }

    .slider-container {
      padding: 0.2rem 0.8rem;
      overflow: visible;
      touch-action: pan-x;
    }

    .slider {
      gap: 10px;
      overflow: visible;
    }

    .slider-action {
      width: 36px;
      height: 36px;
    }

    .slider-action svg {
      font-size: 1.2rem;
    }

    .left {
      left: 4px;
    }

    .right {
      right: 4px;
    }
  }

  @media (max-width: 480px) {
    margin: 0;

    .title {
      margin-left: 0.75rem;
      margin-bottom: 0.2rem;
      font-size: 1rem;
    }

    .slider-container {
      padding: 0.2rem 0.6rem;
      overflow: visible;
      touch-action: pan-x;
      -webkit-overflow-scrolling: touch;
    }

    .slider {
      gap: 8px;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      touch-action: pan-x;
      overflow: visible;
    }

    .slider-action {
      width: 32px;
      height: 32px;
      background: rgba(20, 20, 20, 0.8);
    }

    .slider-action svg {
      font-size: 1rem;
    }

    .left {
      left: 2px;
    }

    .right {
      right: 2px;
    }
  }

  @media (max-width: 360px) {
    .title {
      margin-left: 0.6rem;
      font-size: 0.95rem;
    }

    .slider-container {
      padding: 0.15rem 0.5rem;
      overflow: visible;
    }

    .slider {
      gap: 7px;
      overflow: visible;
    }

    .slider-action {
      width: 29px;
      height: 29px;
    }

    .slider-action svg {
      font-size: 0.9rem;
    }

    .left {
      left: 1px;
    }

    .right {
      right: 1px;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    .slider-action:hover {
      background: rgba(20, 20, 20, 0.75);
      color: #fff;
      transform: translateY(-50%);
    }

    .slider-action:hover svg {
      transform: none;
    }

    .slider {
      cursor: grab;
      touch-action: pan-x;
      user-select: none;
      -webkit-user-select: none;
      overflow: visible;
    }

    .slider:active {
      cursor: grabbing;
    }

    .slider-container {
      overflow: visible;
    }

    .wrapper {
      overflow: visible;
    }
  }
`;



