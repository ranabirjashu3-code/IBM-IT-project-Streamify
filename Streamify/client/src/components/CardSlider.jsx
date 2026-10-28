
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import Card from "./Card";

export default React.memo(function CardSlider({ data = [], title }) {
  const [showControls, setShowControls] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);

  const listRef = useRef(null);
  const viewportRef = useRef(null);

  // Calculate the maximum distance the cards can slide.
  const getMaxOffset = () => {
    const slider = listRef.current;
    const viewport = viewportRef.current;

    if (!slider || !viewport) return 0;

    const styles = window.getComputedStyle(viewport);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;

    const availableWidth =
      viewport.clientWidth - paddingLeft - paddingRight;

    return Math.max(0, slider.scrollWidth - availableWidth);
  };

  // Calculate the width of one card plus its actual CSS gap.
  const getStepSize = () => {
    const slider = listRef.current;

    if (!slider || !slider.children.length) return 179;

    const firstCard = slider.children[0];
    const cardWidth = firstCard.getBoundingClientRect().width;
    const styles = window.getComputedStyle(slider);
    const gap = parseFloat(styles.columnGap) || 0;

    return cardWidth + gap;
  };

  const handleDirection = (direction) => {
    const maxOffset = getMaxOffset();
    const stepSize = getStepSize();

    setSliderPosition((currentPosition) => {
      const nextPosition =
        direction === "right"
          ? currentPosition + stepSize
          : currentPosition - stepSize;

      return Math.max(0, Math.min(nextPosition, maxOffset));
    });
  };

  // Reset when the recommendation list changes.
  useEffect(() => {
    setSliderPosition(0);
  }, [data.length]);

  // Keep the slider position valid after a browser resize.
  useEffect(() => {
    const handleResize = () => {
      setSliderPosition((currentPosition) =>
        Math.min(currentPosition, getMaxOffset())
      );
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const maxOffset = getMaxOffset();
  const canScrollLeft = sliderPosition > 0;
  const canScrollRight = sliderPosition < maxOffset - 1;

  return (
    <Container
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <h2 className="title">{title}</h2>

      <div className="wrapper">
        <button
          type="button"
          aria-label="Scroll left"
          className={`slider-action left ${
            !showControls || !canScrollLeft ? "hide" : ""
          }`}
          onClick={() => handleDirection("left")}
        >
          <AiOutlineLeft />
        </button>

        <div className="slider-container" ref={viewportRef}>
          <div
            className="slider"
            ref={listRef}
            style={{
              transform: `translateX(-${sliderPosition}px)`,
            }}
          >
            {data.map((movie) => (
              <Card
                key={`${movie.mediaType || "movie"}-${movie.id}`}
                movieData={movie}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Scroll right"
          className={`slider-action right ${
            !showControls || !canScrollRight ? "hide" : ""
          }`}
          onClick={() => handleDirection("right")}
        >
          <AiOutlineRight />
        </button>
      </div>
    </Container>
  );
});

const Container = styled.div`
  position: relative;
  z-index: 1;
  margin: 0.15rem 0;
  overflow: visible;

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
  }

  .slider-container {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    padding: 0.3rem 1rem;

    /*
      Clip horizontal overflow so only the current cards show.
      Keep vertical overflow visible for hover popups.
    */
    overflow-x: clip;
    overflow-y: visible;
  }

  .slider {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    width: max-content;
    transition: transform 0.45s ease;
    will-change: transform;
    overflow: visible;
    user-select: none;
    -webkit-user-select: none;
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
    background: rgba(20, 20, 20, 0.85);
    color: #fff;
    cursor: pointer;
    z-index: 100000;
    transition:
      background 0.25s ease,
      color 0.25s ease,
      transform 0.25s ease,
      opacity 0.2s ease;
  }

  .slider-action:hover {
    background: #fff;
    color: #000;
    transform: translateY(-50%) scale(1.08);
  }

  .slider-action svg {
    font-size: 1.8rem;
  }

  .hide {
    opacity: 0;
    pointer-events: none;
  }

  .left {
    left: 8px;
  }

  .right {
    right: 8px;
  }

  @media (min-width: 1440px) {
    .title {
      font-size: 1.6rem;
      margin-left: 2rem;
    }

    .slider-container {
      padding: 0.4rem 1.2rem;
    }

    .slider {
      gap: 16px;
    }

    .slider-action {
      width: 54px;
      height: 54px;
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

    .slider {
      gap: 12px;
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

  @media (max-width: 480px) {
    .title {
      margin-left: 0.75rem;
      margin-bottom: 0.2rem;
      font-size: 1rem;
    }

    .slider-container {
      padding: 0.2rem 0.6rem;
    }

    .slider {
      gap: 8px;
    }

    .slider-action {
      width: 32px;
      height: 32px;
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
    }

    .slider {
      gap: 7px;
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
`;
