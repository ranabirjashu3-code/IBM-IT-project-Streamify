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
  }

  .slider {
    display: flex;
    align-items: center;
    gap: 14px;

    width: max-content;

    transition: transform 0.55s ease;
    will-change: transform;

    overflow: visible;
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

    transition: all 0.25s ease;
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

  @media (max-width: 1024px) {
    .title {
      margin-left: 1.5rem;
      font-size: 1.3rem;
    }

    .slider-container {
      padding: 0.3rem 1rem;
    }

    .slider-action {
      width: 44px;
      height: 44px;
    }

    .slider-action svg {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 768px) {
    margin: 0;

    .title {
      margin-left: 1rem;
      font-size: 1.1rem;
    }

    .slider-container {
      padding: 0.2rem 1rem;
    }

    .slider {
      gap: 10px;
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
`;