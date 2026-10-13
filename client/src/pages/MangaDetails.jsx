import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";
import "../styles/mangaDetails.css";

function formatDate(date) {
  if (!date?.year) return "Unknown";

  const parts = [date.year];

  if (date.month) {
    parts.push(String(date.month).padStart(2, "0"));
  }

  if (date.day) {
    parts.push(String(date.day).padStart(2, "0"));
  }

  return parts.join("-");
}

function MangaDetails() {
  const { mangaId } = useParams();

  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMangaDetails() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/manga/${mangaId}`);
        setManga(response.data.manga);
      } catch (error) {
        console.error("Failed to fetch manga details:", error);
        setError(
          error.response?.status === 404
            ? "Manga not found."
            : "Failed to load manga details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMangaDetails();
  }, [mangaId]);

  if (loading) {
    return <p className="status-text">Loading manga details...</p>;
  }

  if (error || !manga) {
    return (
      <div className="manga-details-container">
        <p className="error-text">{error || "Manga not found."}</p>
        <Link to="/" className="back-link">
          Back to Library
        </Link>
      </div>
    );
  }

  const title =
    manga.title.english ||
    manga.title.romaji ||
    manga.title.native ||
    "Untitled Manga";

  return (
    <main className="manga-details-container">
      <Link to="/" className="back-link">
        &larr; Back to Library
      </Link>

      <section className="manga-details">
        <div className="manga-details-cover">
          <img
            src={manga.coverImage.extraLarge || manga.coverImage.large}
            alt={title}
          />

          <a
            href={manga.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="anilist-link"
          >
            View on AniList
          </a>
        </div>

        <div className="manga-details-info">
          <h1>{title}</h1>

          {manga.title.romaji && manga.title.romaji !== title && (
            <p className="manga-alternative-title">{manga.title.romaji}</p>
          )}

          {manga.title.native && (
            <p className="manga-native-title">{manga.title.native}</p>
          )}

          <div className="manga-detail-tags">
            {manga.status && (
              <span className="detail-tag">
                {manga.status.replaceAll("_", " ")}
              </span>
            )}

            {manga.format && (
              <span className="detail-tag">
                {manga.format.replaceAll("_", " ")}
              </span>
            )}
          </div>

          <div className="manga-metadata">
            <div>
              <span>Chapters</span>
              <strong>{manga.chapters ?? "Unknown"}</strong>
            </div>

            <div>
              <span>Volumes</span>
              <strong>{manga.volumes ?? "Unknown"}</strong>
            </div>

            <div>
              <span>AniList Score</span>
              <strong>
                {manga.averageScore != null
                  ? `${(manga.averageScore / 10).toFixed(1)} / 10`
                  : "Not rated"}
              </strong>
            </div>

            <div>
              <span>Country</span>
              <strong>{manga.countryOfOrigin || "Unknown"}</strong>
            </div>

            <div>
              <span>Start Date</span>
              <strong>{formatDate(manga.startDate)}</strong>
            </div>

            <div>
              <span>End Date</span>
              <strong>{formatDate(manga.endDate)}</strong>
            </div>
          </div>

          {manga.genres?.length > 0 && (
            <section className="manga-genres">
              <h2>Genres</h2>
              <div className="genre-list">
                {manga.genres.map((genre) => (
                  <span className="genre-tag" key={genre}>
                    {genre}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="manga-description">
            <h2>Synopsis</h2>
            <p>
              {manga.description || "No synopsis is available for this manga."}
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

export default MangaDetails;
