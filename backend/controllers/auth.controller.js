import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

export const register = [
  body("username")
    .notEmpty().withMessage("Username is required.")
    .isLength({ min: 3 }).withMessage("Username must be at least 3 characters."),
  body("email")
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Invalid email format."),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array().map(err => err.msg).join(", ")));
    }

    try {
      const hash = bcrypt.hashSync(req.body.password, 5);
      const newUser = new User({
        ...req.body,
        password: hash,
      });

      await newUser.save();
      res.status(201).json({ message: "User has been created." });
    } catch (err) {
      next(err);
    }
  },
];

// ✅ Updated login: now uses email instead of username
export const login = [
  body("email").notEmpty().withMessage("Email is required.").isEmail().withMessage("Invalid email format."),
  body("password").notEmpty().withMessage("Password is required."),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array().map(err => err.msg).join(", ")));
    }

    try {
      // 🔑 Find by email, not username
      const user = await User.findOne({ email: req.body.email });
      if (!user) return next(createError(404, "User not found!"));

      const isCorrect = bcrypt.compareSync(req.body.password, user.password);
      if (!isCorrect) return next(createError(400, "Wrong email or password!"));

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_KEY,
        { expiresIn: "1d" }
      );

      const { password, ...info } = user._doc;
      res
        .cookie("accessToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
        })
        .status(200)
        .json({ ...info, token });
    } catch (err) {
      next(err);
    }
  },
];

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({ message: "User has been logged out." });
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return next(createError(404, "User not found!"));
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
