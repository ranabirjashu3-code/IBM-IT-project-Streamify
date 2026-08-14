import React from "react";
import background from "../assets/login.jpg";
import styled from "styled-components";

export default function BackgroundImage() {
  console.log(background);
  return (
    <Container>
      <img src={background} alt="Background" />
      <div className="overlay"></div>
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
  }
`;