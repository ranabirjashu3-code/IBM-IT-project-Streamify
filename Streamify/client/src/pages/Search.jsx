import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { FaSearch, FaFilm, FaRedo } from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import { getGenres, fetchCategory } from "../store";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query")?.trim() || "";

  const dispatch = useDispatch();

  const genresLoaded = useSelector(
    (state) => state.streamify.genresLoaded
  );

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchInput, setSearchInput] = useState(query);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load movie and TV genres.
  useEffect(() => {
    if (!genresLoaded) {
      dispatch(getGenres());
    }
  }, [dispatch, genresLoaded]);

  // Update navbar on scroll.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Sync the input when the URL query changes.
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Update the URL as the user types, with a short debounce.
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = searchInput.trim();
      const currentQuery =
        searchParams.get("query")?.trim() || "";

      if (value === currentQuery) return;

      if (value) {
        setSearchParams({ query: value }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  // Fetch search results.
  useEffect(() => {
    let cancelled = false;

    const activeQuery = searchInput.trim();

    if (!genresLoaded || !activeQuery) {
      setSearchResults([]);
      setLoading(false);
      setError("");
      return () => {
        cancelled = true;
      };
    }

    const searchMovies = async () => {
      setLoading(true);
      setError("");

      try {
        const action = await dispatch(
          fetchCategory({
            page: "home",
            category: "searchResults",
            endpoint: `/search/multi?query=${encodeURIComponent(
              activeQuery
            )}`,
            paging: false,
            maxItems: 20,
            maxPages: 1,
          })
        );

        if (cancelled) return;

        if (!fetchCategory.fulfilled.match(action)) {
          throw new Error("Unable to fetch search results.");
        }

        const results = (action.payload.data || []).filter(
          (item) =>
            item.mediaType === "movie" ||
            item.mediaType === "tv"
        );

        setSearchResults(results);
      } catch (err) {
        if (!cancelled) {
          console.error("Search error:", err);
          setSearchResults([]);
          setError(
            "Unable to load search results. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    searchMovies();

    return () => {
      cancelled = true;
    };
  }, [dispatch, genresLoaded, searchInput]);

  // Retry search.
  const handleRetry = async () => {
    const activeQuery = searchInput.trim();

    if (!activeQuery) return;

    setLoading(true);
    setError("");

    try {
      const action = await dispatch(
        fetchCategory({
          page: "home",
          category: "searchResults",
          endpoint: `/search/multi?query=${encodeURIComponent(
            activeQuery
          )}`,
          paging: false,
          maxItems: 20,
          maxPages: 1,
        })
      );

      if (!fetchCategory.fulfilled.match(action)) {
        throw new Error("Search request failed.");
      }

      const results = (action.payload.data || []).filter(
        (item) =>
          item.mediaType === "movie" ||
          item.mediaType === "tv"
      );

      setSearchResults(results);
    } catch (err) {
      console.error("Search retry error:", err);
      setError("Unable to load results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeQuery = searchInput.trim();

  return (
    <Container>
      <Navbar isScrolled={isScrolled} />

      <main className="search-page">
        <section className="search-header">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            STREAMIFY DISCOVERY
          </div>

          <h1>
            Discover your
            <br />
            <span>next favorite.</span>
          </h1>

          <p className="description">
            Explore movies and TV shows. Your next great watch
            starts here.
          </p>

          {/* Search input on the Search page */}
          <div className="page-search-box">
            <FaSearch />

            <input
              type="search"
              placeholder="Search movies and TV shows..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search movies and TV shows"
            />

            {searchInput && (
              <button
                type="button"
                className="clear-search"
                aria-label="Clear search"
                onClick={() => setSearchInput("")}
              >
                ×
              </button>
            )}
          </div>

          {activeQuery && (
            <div className="query-card">
              <div className="query-icon">
                <FaSearch />
              </div>

              <div className="query-details">
                <span className="query-label">
                  SEARCH RESULTS FOR
                </span>

                <h2>{activeQuery}</h2>
              </div>

              {!loading && !error && (
                <div className="result-count">
                  <strong>{searchResults.length}</strong>
                  <span>
                    {searchResults.length === 1
                      ? "title found"
                      : "titles found"}
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="results-section">
          {!activeQuery && (
            <EmptyState>
              <div className="empty-icon">
                <FaSearch />
              </div>

              <h2>What are you looking for?</h2>

              <p>
                Enter a movie or TV show title in the search
                bar above to discover matching results.
              </p>
            </EmptyState>
          )}

          {activeQuery && loading && (
            <>
              <div className="section-heading">
                <h2>Finding your next watch</h2>
                <span className="loading-dot" />
              </div>

              <div className="results-grid skeleton-grid">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div className="skeleton-card" key={index}>
                    <div className="skeleton-poster" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeQuery && !loading && error && (
            <EmptyState>
              <div className="empty-icon">
                <FaRedo />
              </div>

              <h2>Something went wrong</h2>
              <p>{error}</p>

              <button
                type="button"
                className="retry-button"
                onClick={handleRetry}
              >
                <FaRedo />
                Try again
              </button>
            </EmptyState>
          )}

          {activeQuery &&
            !loading &&
            !error &&
            searchResults.length === 0 && (
              <EmptyState>
                <div className="empty-icon">
                  <FaFilm />
                </div>

                <h2>No titles found</h2>

                <p>
                  We couldn't find anything matching "
                  {activeQuery}". Try another title or check
                  your spelling.
                </p>
              </EmptyState>
            )}

          {activeQuery &&
            !loading &&
            !error &&
            searchResults.length > 0 && (
              <>
                <div className="section-heading">
                  <div>
                    <span className="section-label">
                      YOUR DISCOVERIES
                    </span>

                    <h2>Matching titles</h2>
                  </div>

                  <span className="total-count">
                    {searchResults.length} results
                  </span>
                </div>

                <div className="results-grid">
                  {searchResults.map((item) => (
                    <div
                      className="search-card-wrapper"
                      key={`${item.mediaType}-${item.id}`}
                    >
                      <Card movieData={item} />
                    </div>
                  ))}
                </div>
              </>
            )}
        </section>
      </main>

      <Footer />
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgba(31, 111, 80, 0.13),
      transparent 45%
    ),
    #0b0b0f;
  color: #fff;

  /* MAIN PAGE */
  .search-page {
    width: min(1600px, 100%);
    margin: 0 auto;
    padding: 82px 4% 60px;
    min-height: 100vh;
    box-sizing: border-box;
  }

  /* HEADER */
  .search-header {
    margin-bottom: 20px;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    color: #9ca3af;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2.5px;
  }

  .eyebrow-line {
    width: 28px;
    height: 2px;
    background: #22c55e;
  }

  .search-header h1 {
    margin: 0;
    font-size: clamp(30px, 3.5vw, 42px);
    line-height: 1.02;
    font-weight: 800;
    letter-spacing: -1px;
  }

  .search-header h1 span {
    color: #22c55e;
  }

  .description {
    max-width: 500px;
    margin: 9px 0 0;
    color: #a1a1aa;
    font-size: 13px;
    line-height: 1.5;
  }

  /* SEARCH INPUT */
  .page-search-box {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    max-width: 500px;
    margin-top: 14px;
    padding: 0 14px;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    color: #22c55e;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .page-search-box:focus-within {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }

  .page-search-box > svg {
    flex-shrink: 0;
  }

  .page-search-box input {
    flex: 1;
    width: 100%;
    min-width: 0;
    height: 42px;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    color: #fff;
    font-size: 14px;
  }

  .page-search-box input::placeholder {
    color: #888;
  }

  .page-search-box input::-webkit-search-cancel-button {
    cursor: pointer;
  }

  .page-search-box .clear-search {
    flex-shrink: 0;
    padding: 0 2px;
    border: none;
    background: transparent;
    color: #a1a1aa;
    font-size: 24px;
    cursor: pointer;
  }

  .page-search-box .clear-search:hover {
    color: #fff;
  }

  /* SEARCH SUMMARY */
  .query-card {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 14px;
    padding: 10px 14px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.035);
  }

  .query-icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(34, 197, 94, 0.12);
    color: #22c55e;
    font-size: 16px;
  }

  .query-details {
    min-width: 0;
  }

  .query-label,
  .section-label {
    display: block;
    color: #9ca3af;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.5px;
  }

  .query-details h2 {
    margin: 4px 0 0;
    overflow-wrap: anywhere;
    font-size: 16px;
    font-weight: 700;
  }

  .result-count {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    margin-left: auto;
    color: #a1a1aa;
    font-size: 11px;
    white-space: nowrap;
  }

  .result-count strong {
    color: #22c55e;
    font-size: 21px;
  }

  /* RESULTS SECTION */
  .results-section {
    width: 100%;
    min-height: 0;
    overflow: visible;
  }

  .section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }

  .section-heading h2 {
    margin: 5px 0 0;
    font-size: 21px;
    font-weight: 700;
  }

  .total-count {
    padding-bottom: 3px;
    color: #a1a1aa;
    font-size: 12px;
  }

  /* MOVIE AND TV GRID */
  .results-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    justify-items: stretch;
    align-items: start;
    gap: 20px;
    width: 100%;
    overflow: visible;
  }

  .search-card-wrapper {
    display: block;
    width: 100%;
    min-width: 0;
    overflow: visible;
  }

  .search-card-wrapper > * {
    max-width: 100%;
  }

  /* LOADING SKELETONS */
  .skeleton-grid {
    justify-items: stretch;
  }

  .skeleton-card {
    width: 100%;
    min-width: 0;
  }

  .skeleton-poster,
  .skeleton-line {
    background: linear-gradient(
      90deg,
      #18181b 25%,
      #27272a 50%,
      #18181b 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .skeleton-poster {
    width: 100%;
    aspect-ratio: 2 / 3;
    border-radius: 8px;
  }

  .skeleton-line {
    height: 12px;
    margin-top: 12px;
    border-radius: 4px;
  }

  .skeleton-line.short {
    width: 55%;
    height: 9px;
    margin-top: 8px;
  }

  .loading-dot {
    width: 8px;
    height: 8px;
    margin-bottom: 6px;
    border-radius: 50%;
    background: #22c55e;
    animation: pulse 1s infinite alternate;
  }

  /* RETRY BUTTON */
  .retry-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    margin-top: 20px;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    background: #22c55e;
    color: #07120a;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .retry-button:hover {
    background: #16a34a;
  }

  /* ANIMATIONS */
  @keyframes shimmer {
    from {
      background-position: 100% 0;
    }
    to {
      background-position: -100% 0;
    }
  }

  @keyframes pulse {
    from {
      opacity: 0.35;
    }
    to {
      opacity: 1;
    }
  }

  /* TABLET */
  @media (max-width: 1100px) {
    .results-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }
  }

  /* SMALL TABLET */
  @media (max-width: 750px) {
    .search-page {
      padding: 78px 4% 45px;
    }

    .search-header {
      margin-bottom: 18px;
    }

    .search-header h1 {
      font-size: clamp(29px, 6vw, 38px);
    }

    .results-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px 8px;
    }

    .section-heading h2 {
      font-size: 19px;
    }
  }

  /* PHONE */
  @media (max-width: 480px) {
    .search-page {
      padding: 75px 4% 45px;
    }

    .eyebrow {
      margin-bottom: 12px;
      font-size: 9px;
      letter-spacing: 2px;
    }

    .search-header h1 {
      font-size: 32px;
      letter-spacing: -1px;
    }

    .description {
      margin-top: 10px;
      font-size: 13px;
    }

    .page-search-box {
      margin-top: 14px;
      padding: 0 12px;
    }

    .page-search-box input {
      height: 42px;
    }

    .query-card {
      gap: 9px;
      margin-top: 14px;
      padding: 10px;
    }

    .query-icon {
      width: 32px;
      height: 32px;
      font-size: 15px;
    }

    .query-label,
    .section-label {
      font-size: 8px;
      letter-spacing: 1.1px;
    }

    .query-details h2 {
      font-size: 14px;
    }

    .result-count {
      font-size: 10px;
    }

    .result-count strong {
      font-size: 18px;
    }

    .section-heading {
      margin-bottom: 12px;
    }

    .section-heading h2 {
      font-size: 18px;
    }

    .total-count {
      font-size: 11px;
    }

    .results-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px 8px;
    }
  }

  /* VERY SMALL PHONE */
  @media (max-width: 360px) {
    .search-header h1 {
      font-size: 29px;
    }

    .query-card {
      gap: 7px;
      padding: 9px;
    }

    .query-icon {
      width: 30px;
      height: 30px;
    }

    .result-count strong {
      font-size: 16px;
    }

    .results-grid {
      gap: 14px 6px;
    }
  }

  /* REDUCED MOTION */
  @media (prefers-reduced-motion: reduce) {
    .skeleton-poster,
    .skeleton-line,
    .loading-dot {
      animation: none;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  min-height: 200px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
  text-align: center;

  .empty-icon {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    margin-bottom: 16px;
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 15px;
    background: rgba(34, 197, 94, 0.08);
    color: #22c55e;
    font-size: 21px;
  }

  h2 {
    margin: 0;
    color: #f4f4f5;
    font-size: 21px;
    font-weight: 700;
  }

  p {
    max-width: 420px;
    margin: 10px 0 0;
    color: #a1a1aa;
    font-size: 14px;
    line-height: 1.7;
  }
`;