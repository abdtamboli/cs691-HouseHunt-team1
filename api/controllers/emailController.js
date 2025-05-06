import prisma from "../lib/prisma.js";
import nodemailer from "nodemailer";
import { promisify } from "util";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Promisify sendMail so we can await it
const sendMail = promisify(transporter.sendMail.bind(transporter));

/**
 * Controller to handle scheduling a property visit.
 */
export const scheduleVisit = async (req, res) => {
  const { postId, dateTime } = req.body;
  const userId = req.userId;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true }, // the post owner
    });

    if (!user || !post || !post.user) {
      return res.status(404).json({ message: "User or post not found!" });
    }

    // Email to the visitor
    await sendMail({
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Property Visit Scheduled",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #eb7100;">Property Visit Scheduled!</h2>
            <p>Hello,</p>
            <p>Thank you for scheduling a property visit with us. Here are your details:</p>
            <table style="margin: 20px 0;">
              <tr>
                <td><strong>Visit Date & Time:</strong></td>
                <td>${new Date(dateTime).toLocaleString()}</td>
              </tr>
              <tr>
                <td><strong>Property Address:</strong></td>
                <td>${post.address}</td>
              </tr>
            </table>
            <p>We look forward to seeing you! 🚪🏡</p>
            <p style="margin-top: 40px; font-size: 14px; color: #666;">HouseHunt Team</p>
          </div>
        </div>
      `,
    });

    // Email to the property owner
    await sendMail({
      from: process.env.MAIL_USER,
      to: post.user.email,
      subject: "New Visit Scheduled for Your Property",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0px 4px 15px rgba(0,0,0,0.1);">
    <h2 style="color: #eb7100;">📅 New Property Visit Scheduled</h2>
    <p>Hello <strong>${post.user.username}</strong>,</p>
    <p><strong>${
      user.username
    }</strong> has scheduled a visit for your property</p>
    <table style="margin: 20px 0;">
              <tr>
                <td><strong>Visit Date & Time:</strong></td>
                <td>${new Date(dateTime).toLocaleString()}</td>
              </tr>
              <tr>
                <td><strong>Property Address:</strong></td>
                <td>${post.address}</td>
              </tr>
            </table>
    <p>Please ensure the property is ready for the visit.</p>
    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">— HouseHunt Team</p>
  </div>
</div>
      `,
    });

    return res
      .status(200)
      .json({ message: "Emails sent to visitor and owner." });
  } catch (err) {
    console.error("scheduleVisit error:", err);
    return res.status(500).json({ message: "Failed to schedule visit." });
  }
};

/**
 * Controller to handle property inquiries.
 */
export const propertyInquiry = async (req, res) => {
  const { postId, message } = req.body;
  const userId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post || !post.user) {
      return res.status(404).json({ message: "Post or owner not found!" });
    }

    await sendMail({
      from: process.env.MAIL_USER,
      to: post.user.email,
      subject: "New Inquiry About Your Property",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #eb7100;">New Inquiry About Your Property!</h2>
            <p>Hello,</p>
            <p>You have received a new inquiry message for your property:</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #fbe2c7; border-left: 4px solid #eb7100;">
              <p style="font-style: italic;font-size: 16px">"${message}"</p>
            </div>
            <p>Please respond to the user as soon as possible. 📩</p>
            <p style="margin-top: 40px; font-size: 14px; color: #666;">HouseHunt Team</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ message: "Inquiry sent to owner!" });
  } catch (err) {
    console.error("propertyInquiry error:", err);
    return res.status(500).json({ message: "Failed to send inquiry." });
  }
};

/**
 * Controller to handle purchase/rent invoice and mark the property unavailable.
 */
export const purchaseInvoice = async (req, res) => {
  const { postId } = req.body;
  const userId = req.userId;

  try {
    // Fetch post and buyer
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });
    const buyer = await prisma.user.findUnique({ where: { id: userId } });

    if (!post || !post.user || !buyer) {
      return res.status(404).json({ message: "Post or user not found!" });
    }

    // Send receipt to buyer
    await sendMail({
      from: process.env.MAIL_USER,
      to: buyer.email,
      subject:
        post.type === "rent" ? "Your Rent Receipt" : "Your Purchase Receipt",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #eb7100;">${
              post.type === "rent" ? "Rent Receipt" : "Purchase Receipt"
            }</h2>
            <p><strong>Receipt Date:</strong> ${new Date().toLocaleDateString()}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Property Address:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${
                  post.address
                }</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Tenant Name:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${
                  buyer.username
                }</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Date of Payment:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Paid To:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${
                  post.user.username
                }</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Total Amount:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">$${
                  post.price
                }</td>
              </tr>
            </table>
            <p style="margin-top: 20px;">Thank you for choosing HouseHunt!</p>
          </div>
        </div>
      `,
    });

    // Notify the property owner
    await sendMail({
      from: process.env.MAIL_USER,
      to: post.user.email,
      subject:
        post.type === "rent"
          ? "Your Property Was Rented"
          : "Your Property Was Purchased",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0px 4px 15px rgba(0,0,0,0.1);">
    <h2 style="color: #0ea5e9;">✅ Property ${
      post.type === "rent" ? "Rented" : "Purchased"
    }</h2>
    <p>Hello <strong>${post.user.username}</strong>,</p>
    <p>Your property at <strong>${post.address}</strong> has been ${
        post.type === "rent" ? "rented" : "purchased"
      } by <strong>${buyer.username}</strong>.</p>
    <p><strong>Total Amount:</strong> $${post.price}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    <p>Great work! 🎉</p>
    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">— HouseHunt Team</p>
  </div>
</div>
      `,
    });

    // Mark the property as unavailable
    const newStatus = post.type === "rent" ? "rented" : "sold";
    await prisma.post.update({
      where: { id: postId },
      data: { status: newStatus },
    });

    return res
      .status(200)
      .json({ message: `Invoice sent and property marked as ${newStatus}.` });
  } catch (err) {
    console.error("purchaseInvoice error:", err);
    return res
      .status(500)
      .json({ message: "Failed to process purchase invoice." });
  }
};
