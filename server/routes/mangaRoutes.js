import express from "express";
import db from "../db.js";
import { searchManga } from "../services/mangaList.js";

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

export default router;
