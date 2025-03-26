import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

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

    // setTimeout(() => {
    res.status(200).json(posts);
    // }, 3000);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      return jwt.verify(
        token,
        process.env.JWT_SECRET_KEY,
        async (err, payload) => {
          // ✅ Add return to prevent further execution
          if (!err) {
            const saved = await prisma.savedPost.findUnique({
              where: {
                userId_postId: {
                  postId: id,
                  userId: payload.id,
                },
              },
            });
            return res
              .status(200)
              .json({ ...post, isSaved: saved ? true : false }); // ✅ Use return here
          }
          return res.status(200).json({ ...post, isSaved: false }); // ✅ Also return here
        }
      );
    }

    return res.status(200).json({ ...post, isSaved: false }); // ✅ Return the response to prevent double execution
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { postData, postDetail } = req.body;

  try {
    // Find the post to ensure it exists and that the user is authorized.
    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (existingPost.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    // Update the post along with its postDetail
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...postData,
        postDetail: {
          update: { ...postDetail },
        },
      },
      include: { postDetail: true },
    });

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.userId; // Set by verifyToken middleware

  try {
    // Fetch the post along with its postDetail relation
    const post = await prisma.post.findUnique({
      where: { id },
      include: { postDetail: true },
    });

    if (!post) {
      console.log("Post not found:", id);
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== tokenUserId) {
      console.log(`User ${tokenUserId} is not authorized to delete post ${id}`);
      return res.status(403).json({ message: "Not Authorized!" });
    }

    // If the post has a related PostDetail, delete it first
    if (post.postDetail) {
      await prisma.postDetail.delete({
        where: { postId: id },
      });
    }

    // Now delete the Post
    await prisma.post.delete({
      where: { id },
    });

    console.log(`Post ${id} deleted by user ${tokenUserId}`);
    return res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", err);
    return res.status(500).json({ message: "Failed to delete post" });
  }
};
