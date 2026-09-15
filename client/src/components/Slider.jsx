import React from "react";
import CardSlider from "./CardSlider";
import styled from "styled-components";

export default function Slider({ sections }) {
  return (
    <Container>
      {sections.map((section) => (
        <CardSlider
          key={section.title}
          title={section.title}
          data={(section.data || []).slice(0, 20)}
        />
      ))}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  width: 100%;
  background: #141414;

  display: flex;
  flex-direction: column;
  gap: 0.8rem;

  padding: 0 0 2rem;

  overflow: visible;
  z-index: 1;

  @media (max-width: 1024px) {
    gap: 0.6rem;
  }

  @media (max-width: 768px) {
    gap: 0.4rem;
    padding-bottom: 1rem;
  }
`;