import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import requireAuth from "./middleware/requireAuth.js";
import mangaRoutes from "./routes/mangaRoutes.js";
import db from "./db.js";

dotenv.config();

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/manga", mangaRoutes);

app.get("/api/profile", requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, email FROM users WHERE id = $1`,
      [req.session.userId],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
