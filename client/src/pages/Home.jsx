import { useState } from "react";
import { useAuth } from "../context/useAuth.js";
import api from "../api/axios.js";

function Home() {
  const { user, loading } = useAuth();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    if (!search.trim()) {
      return;
    }

    try {
      setSearchLoading(true);
      setError("");

      const response = await api.get("/manga/search", {
        params: {
          query: search,
        },
      });

      setResults(response.data.media);
    } catch (error) {
      console.error(error);
      setError("Failed to search manga.");
    } finally {
      setSearchLoading(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "3rem",
          color: "#BBE1FA",
        }}
      >
        <h2>Welcome to Gakuran</h2>
        <p>Login or Register to start tracking your manga.</p>
      </div>
    );
  }

  async function handleAddToLibrary(mangaId) {
    try {
      const response = await api.post("/manga", {
        mangaId,
      });

      console.log(response.data);
    } catch (error) {
      console.error(
        "Failed to add manga:",
        error.response?.data?.error || error.message,
      );
    }
  }

  return (
    <div>
      <h2>Welcome back, {user.username}!</h2>

      <h3>Your Manga Library</h3>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search manga..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      {searchLoading && <p>Searching...</p>}

      {error && <p>{error}</p>}

      <div>
        {results.map((manga) => (
          <div key={manga.id}>
            <img
              src={manga.coverImage.large}
              alt={manga.title.english || manga.title.romaji}
              width="150"
            />

            <h4>{manga.title.english || manga.title.romaji}</h4>

            <p>Chapters: {manga.chapters ?? "Unknown"}</p>

            <button onClick={() => handleAddToLibrary(manga.id)}>
              Add to Library
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
