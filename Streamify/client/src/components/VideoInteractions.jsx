
import { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { BiLike, BiDislike } from "react-icons/bi";
import { firebaseAuth } from "../Utils/firebase-config";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL;

const VideoInteractions = ({ contentId }) => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [message, setMessage] = useState("");

  // Wait until Firebase resolves the current authentication state.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, () => {
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  // Load reaction counts and the current user's reaction.
  useEffect(() => {
    if (!contentId || !authReady) return;

    let cancelled = false;

    const fetchInteractions = async () => {
      try {
        setMessage("");

        const response = await axios.get(
          `${API_URL}/api/interactions/${contentId}`
        );

        if (cancelled) return;

        const data = response.data;
        const user = firebaseAuth.currentUser;

        setLikes(Number(data.likes) || 0);
        setDislikes(Number(data.dislikes) || 0);

        setLiked(
          Boolean(user && data.likedBy?.includes(user.uid))
        );

        setDisliked(
          Boolean(user && data.dislikedBy?.includes(user.uid))
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to fetch interactions:",
            error.response?.data || error.message
          );
          setMessage("Couldn't load reactions.");
        }
      }
    };

    fetchInteractions();

    return () => {
      cancelled = true;
    };
  }, [contentId, authReady]);

  const handleReaction = async (type) => {
    const user = firebaseAuth.currentUser;

    if (!user) {
      setMessage("Please log in to react to this title.");
      return;
    }

    if (!contentId) {
      setMessage("This title has no valid content ID.");
      return;
    }

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API_URL}/api/interactions/${contentId}/${type}`,
        { userId: user.uid }
      );

      const data = response.data;

      setLikes(Number(data.likes) || 0);
      setDislikes(Number(data.dislikes) || 0);

      // Keep compatibility with the response format currently used
      // by your backend.
      if (type === "like") {
        setLiked(
          typeof data.liked === "boolean" ? data.liked : true
        );
        setDisliked(false);
      } else {
        setDisliked(
          typeof data.disliked === "boolean"
            ? data.disliked
            : true
        );
        setLiked(false);
      }
    } catch (error) {
      console.error(
        `${type} error:`,
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          `Unable to ${type} this title. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <InteractionGroup>
        <InteractionButton
          type="button"
          onClick={() => handleReaction("like")}
          $active={liked}
          disabled={loading || !contentId}
          aria-label="Like"
          aria-pressed={liked}
          title="Like"
        >
          <BiLike />
          <span>{likes}</span>
        </InteractionButton>

        <Divider />

        <InteractionButton
          type="button"
          onClick={() => handleReaction("dislike")}
          $active={disliked}
          disabled={loading || !contentId}
          aria-label="Dislike"
          aria-pressed={disliked}
          title="Dislike"
        >
          <BiDislike />
          <span>{dislikes}</span>
        </InteractionButton>
      </InteractionGroup>

      {message && (
        <StatusMessage role="status">
          {message}
        </StatusMessage>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 1.5rem 0 0;
  padding: 0;
  box-sizing: border-box;
`;

const InteractionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  height: 44px;
  padding: 0 6px;
  border: 1px solid #292929;
  border-radius: 22px;
  background: #141414;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);

  @media (max-width: 520px) {
    height: 40px;
    padding: 0 4px;
  }
`;

const InteractionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 34px;
  padding: 0 13px;
  border: none;
  border-radius: 17px;
  background: ${({ $active }) =>
    $active ? "rgba(70, 211, 105, 0.16)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "#46d369" : "#9a9a9a"};
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  svg {
    width: 19px;
    height: 19px;
    flex-shrink: 0;
  }

  span {
    min-width: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1;
  }

  &:hover:not(:disabled) {
    background: #252525;
    color: #46d369;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 520px) {
    gap: 6px;
    height: 30px;
    padding: 0 10px;
    font-size: 0.82rem;

    svg {
      width: 17px;
      height: 17px;
    }

    span {
      font-size: 0.78rem;
    }
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 22px;
  margin: 0 3px;
  background: #353535;

  @media (max-width: 520px) {
    height: 19px;
    margin: 0 2px;
  }
`;

const StatusMessage = styled.p`
  margin: 0;
  color: #f87171;
  font-size: 12px;
`;

export default VideoInteractions;
