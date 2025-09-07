import Post from "../models/post.model.js";
import createError from "../utils/createError.js";
import { body, validationResult } from "express-validator";

export const createPost = [
  body("title").notEmpty().withMessage("Title is required."),
  body("content").notEmpty().withMessage("Content is required."),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array().map(err => err.msg).join(", ")));
    }

    try {
      const newPost = new Post({
        ...req.body,
        author: req.userId,
      });
      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (err) {
      next(err);
    }
  }
];

export const updatePost = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty."),
  body("content").optional().notEmpty().withMessage("Content cannot be empty."),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array().map(err => err.msg).join(", ")));
    }

    try {
      const post = await Post.findById(req.params.id);
      if (!post) return next(createError(404, "Post not found!"));
      if (post.author.toString() !== req.userId) 
        return next(createError(403, "You can update only your posts!"));

      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.status(200).json(updatedPost);
    } catch (err) {
      next(err);
    }
  }
];

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(createError(404, "Post not found!"));
    if (post.author.toString() !== req.userId) 
      return next(createError(403, "You can delete only your posts!"));

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post has been deleted." });
  } catch (err) {
    next(err);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "-password");
    if (!post) return next(createError(404, "Post not found!"));
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "-password")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.userId })
      .populate("author", "-password")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};
