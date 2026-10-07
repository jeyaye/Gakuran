import express from "express";
import bcrypt from "bcrypt";

import db from "../db.js";

const router = express.Router();
const saltRounds = 12;

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  if (/\s/.test(username) || /\s/.test(email) || /\s/.test(password)) {
    return res.status(400).json({
      error: "Inputs cannot contain whitespace",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters",
    });
  }

  try {
    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email`,
      [username, email, passwordHash],
    );

    res.status(201).json({
      message: "Registration successful",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  try {
    const result = await db.query(
      `SELECT id, username, email, password FROM users WHERE email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    req.session.userId = user.id;

    res.json({
      message: "Login Successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  try {
    const result = await db.query(
      `SELECT id, username, email
       FROM users
       WHERE id = $1`,
      [req.session.userId],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        error: "Could not logout",
      });
    }

    res.clearCookie("sid");

    res.json({
      message: "Logged out successfully",
    });
  });
});

export default router;
