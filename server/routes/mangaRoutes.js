import express from "express";
import db from "../db.js";
import { searchManga, getMangaByIds } from "../services/mangaList.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query?.trim()) {
    return res.status(400).json({
      error: "Search query is required",
    });
  }

  try {
    const results = await searchManga(query);

    res.json(results);
  } catch (error) {
    console.error("Manga search error:", error);

    res.status(500).json({
      error: "Failed to search manga",
    });
  }
});

router.post("/", async (req, res) => {
  const userId = req.session.userId;
  const { mangaId } = req.body;

  if (!userId) {
    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  if (!mangaId) {
    return res.status(400).json({
      error: "Manga ID is required",
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO user_manga (user_id, manga_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, manga_id) DO NOTHING
       RETURNING *`,
      [userId, mangaId],
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        error: "Manga is already in your library",
      });
    }

    res.status(201).json({
      message: "Manga added to library",
      manga: result.rows[0],
    });
  } catch (error) {
    console.error("Add manga error:", error);

    res.status(500).json({
      error: "Failed to add manga",
    });
  }
});

router.get("/", async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  try {
    const result = await db.query(
      `SELECT manga_id, status, progress, rating
       FROM user_manga
       WHERE user_id = $1
       ORDER BY manga_id`,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.json({ manga: [] });
    }

    const libraryEntries = result.rows;

    const mangaIds = libraryEntries.map((entry) => entry.manga_id);

    const mangaDetails = await getMangaByIds(mangaIds);

    const detailsById = new Map(mangaDetails.map((manga) => [manga.id, manga]));

    const manga = libraryEntries
      .map((entry) => {
        const details = detailsById.get(entry.manga_id);

        if (!details) {
          return null;
        }

        return {
          ...details,
          status: entry.status,
          progress: entry.progress,
          rating: entry.rating,
        };
      })
      .filter(Boolean);

    res.json({ manga });
  } catch (error) {
    console.error("Fetch library error:", error);

    res.status(500).json({
      error: "Failed to fetch manga library",
    });
  }
});

router.patch("/:mangaId", async (req, res) => {
  const userId = req.session.userId;
  const mangaId = Number(req.params.mangaId);
  const { status, progress, rating } = req.body;

  const allowedStatuses = [
    "PLANNING",
    "READING",
    "COMPLETED",
    "PAUSED",
    "DROPPED",
    "REPEATING",
  ];

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!Number.isInteger(mangaId) || mangaId <= 0) {
    return res.status(400).json({ error: "Invalid manga ID" });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid reading status" });
  }

  if (!Number.isInteger(progress) || progress < 0) {
    return res.status(400).json({
      error: "Progress must be a non-negative integer",
    });
  }

  if (
    rating !== null &&
    (!Number.isInteger(rating) || rating < 1 || rating > 10)
  ) {
    return res.status(400).json({
      error: "Rating must be an integer between 1 and 10",
    });
  }

  try {
    const result = await db.query(
      `UPDATE user_manga
       SET status = $1, progress = $2, rating = $3
       WHERE user_id = $4 AND manga_id = $5
       RETURNING *`,
      [status, progress, rating, userId, mangaId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Manga not found in your library",
      });
    }

    res.json({
      message: "Manga updated successfully",
      manga: result.rows[0],
    });
  } catch (error) {
    console.error("Update manga error:", error);
    res.status(500).json({
      error: "Failed to update manga",
    });
  }
});

router.delete("/:mangaId", async (req, res) => {
  const userId = req.session.userId;
  const mangaId = Number(req.params.mangaId);

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!Number.isInteger(mangaId) || mangaId <= 0) {
    return res.status(400).json({ error: "Invalid manga ID" });
  }

  try {
    const result = await db.query(
      `DELETE FROM user_manga WHERE user_id = $1 AND manga_id = $2 RETURNING *`,
      [userId, mangaId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Manga not found in your library" });
    }

    res.json({ message: "Manga removed from library", manga: result.rows[0] });
  } catch (error) {
    console.error("Remove manga error:", error);
    res.status(500).json({
      error: "Failed to remove manga",
    });
  }
});

export default router;
