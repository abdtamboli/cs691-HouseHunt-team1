// controllers/post.controller.js

import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

// Simple ObjectId validator (24 hex chars)
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export const getPosts = async (req, res) => {
  const query = req.query;
  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
    });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ message: "Post not found" });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const token = req.cookies?.token;
    if (token) {
      return jwt.verify(
        token,
        process.env.JWT_SECRET_KEY,
        async (err, payload) => {
          if (!err) {
            const saved = await prisma.savedPost.findUnique({
              where: {
                userId_postId: {
                  postId: id,
                  userId: payload.id,
                },
              },
            });
            return res.status(200).json({ ...post, isSaved: Boolean(saved) });
          }
          return res.status(200).json({ ...post, isSaved: false });
        }
      );
    }

    res.status(200).json({ ...post, isSaved: false });
  } catch (err) {
    console.error(err);
    if (err.code === "P2023") {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const { postData, postDetail } = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...postData,
        userId: tokenUserId,
        postDetail: { create: postDetail },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { postData, postDetail } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(404).json({ message: "Post not found" });
  }

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (existing.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...postData,
        postDetail: { update: postDetail },
      },
      include: { postDetail: true },
    });
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    if (err.code === "P2023") {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.userId;

  if (!isValidObjectId(id)) {
    return res.status(404).json({ message: "Post not found" });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { postDetail: true },
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    if (post.postDetail) {
      await prisma.postDetail.delete({ where: { postId: id } });
    }
    await prisma.post.delete({ where: { id } });
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    if (err.code === "P2023") {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).json({ message: "Failed to delete post" });
  }
};
