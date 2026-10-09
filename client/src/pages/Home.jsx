import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth.js";
import api from "../api/axios.js";
import "../styles/home.css";

function Home() {
  const { user, loading } = useAuth();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  const [library, setLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState("");

  useEffect(() => {
    if (loading || !user) return;

    async function fetchLibrary() {
      try {
        setLibraryLoading(true);
        setLibraryError("");
        const response = await api.get("/manga");
        setLibrary(response.data.manga);
      } catch (error) {
        console.error("Fetch library error:", error);
        setLibraryError("Failed to load your manga library.");
      } finally {
        setLibraryLoading(false);
      }
    }
    fetchLibrary();
  }, [user, loading]);

  async function handleSearch(event) {
    event.preventDefault();
    if (!search.trim()) return;

    try {
      setSearchLoading(true);
      setError("");
      const response = await api.get("/manga/search", {
        params: { query: search },
      });
      setResults(response.data.media);
    } catch (error) {
      console.error(error);
      setError("Failed to search manga.");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleAddToLibrary(mangaId) {
    try {
      await api.post("/manga", { mangaId });
      const response = await api.get("/manga");
      setLibrary(response.data.manga);
    } catch (error) {
      console.error(
        "Failed to add manga:",
        error.response?.data?.error || error.message,
      );
    }
  }

  if (loading) return <p className="loading-text">Loading...</p>;

  if (!user) {
    return (
      <div className="guest-welcome">
        <h2>Welcome to Gakuran</h2>
        <p>Login or Register to start tracking your manga.</p>
      </div>
    );
  }

  return (
    <div className="library-container">
      <div className="dashboard-header">
        <h2>Welcome back, {user.username}!</h2>
      </div>

      <div className="search-section">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for new manga..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>
      </div>

      {searchLoading && <p className="status-text">Searching...</p>}
      {error && <p className="error-text">{error}</p>}

      {results.length > 0 && (
        <div className="results-section">
          <h3>Search Results</h3>
          <div className="manga-grid">
            {results.map((manga) => (
              <div className="manga-card" key={manga.id}>
                <img
                  src={manga.coverImage.large}
                  alt={manga.title.english || manga.title.romaji}
                  className="manga-cover"
                />
                <div className="manga-info">
                  <h3>{manga.title.english || manga.title.romaji}</h3>
                  <p className="manga-progress">
                    Chapters: {manga.chapters ?? "Unknown"}
                  </p>
                  <button
                    className="add-button"
                    onClick={() => handleAddToLibrary(manga.id)}
                  >
                    Add to Library
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="library-section">
        <h3 className="section-title">Your Manga Library</h3>

        {libraryLoading && (
          <p className="status-text">Loading your library...</p>
        )}
        {libraryError && <p className="error-text">{libraryError}</p>}
        {!libraryLoading && !libraryError && library.length === 0 && (
          <p className="empty-text">
            Your library is empty. Search for manga above to get started!
          </p>
        )}

        <div className="manga-grid">
          {library.map((manga) => (
            <div className="manga-card" key={manga.id}>
              <img
                src={manga.coverImage.large}
                alt={manga.title.english || manga.title.romaji}
                className="manga-cover"
              />
              <div className="manga-info">
                <h3>{manga.title.english || manga.title.romaji}</h3>
                
                <span
                  className={`status-badge status-${manga.status.toLowerCase()}`}
                >
                  {manga.status}
                </span>

                <p className="manga-progress">
                  Progress: {manga.progress} / {manga.chapters ?? "Unknown"}{" "}
                  chapters
                </p>

                <div className="manga-inputs">
                  <label>
                    Status
                    <select
                      value={manga.status}
                      onChange={(event) => {
                        const newStatus = event.target.value;
                        setLibrary((prev) =>
                          prev.map((item) =>
                            item.id === manga.id
                              ? { ...item, status: newStatus }
                              : item,
                          ),
                        );
                      }}
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="READING">Reading</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PAUSED">Paused</option>
                      <option value="DROPPED">Dropped</option>
                      <option value="REPEATING">Repeating</option>
                    </select>
                  </label>

                  <label>
                    Chapters Read
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={manga.progress}
                      onChange={(event) => {
                        const val = event.target.value;
                        setLibrary((prev) =>
                          prev.map((item) =>
                            item.id === manga.id
                              ? {
                                  ...item,
                                  progress: val === "" ? "" : Number(val),
                                }
                              : item,
                          ),
                        );
                      }}
                    />
                  </label>

                  <label>
                    Rating
                    <select
                      value={manga.rating ?? ""}
                      onChange={(event) => {
                        const val = event.target.value;
                        setLibrary((prev) =>
                          prev.map((item) =>
                            item.id === manga.id
                              ? {
                                  ...item,
                                  rating: val === "" ? null : Number(val),
                                }
                              : item,
                          ),
                        );
                      }}
                    >
                      <option value="">Not Rated</option>
                      {Array.from({ length: 10 }, (_, index) => (
                        <option key={index + 1} value={index + 1}>
                          {index + 1} / 10
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="manga-actions">
                  <button
                    className="save-button"
                    onClick={async () => {
                      try {
                        await api.patch(`/manga/${manga.id}`, {
                          status: manga.status,
                          progress: manga.progress,
                          rating: manga.rating,
                        });
                        const res = await api.get("/manga");
                        setLibrary(res.data.manga);
                      } catch (error) {
                        console.error("Failed to update manga:", error);
                      }
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="remove-button"
                    onClick={async () => {
                      try {
                        await api.delete(`/manga/${manga.id}`);
                        setLibrary((prev) =>
                          prev.filter((item) => item.id !== manga.id),
                        );
                      } catch (error) {
                        console.error("Failed to remove manga:", error);
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
