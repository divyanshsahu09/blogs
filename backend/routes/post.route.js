import express from "express";
import {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getPosts,
  getUserPosts
} from "../controllers/post.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, createPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.get("/single/:id", getPost);
router.get("/", getPosts);
router.get("/user", verifyToken, getUserPosts);

export default router;
