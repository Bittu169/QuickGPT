import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js";

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    );
};

// API to Register User
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if all fields are provided
        if (!name || !email || !password) {
            return res.json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.json({
                success: false,
                message: "User already exists",
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
        });

        // Generate token
        const token = generateToken(user._id);

        return res.json({
            success: true,
            token,
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// API to Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if all fields are provided
        if (!email || !password) {
            return res.json({
                success: false,
                message: "Please provide email and password",
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate token
        const token = generateToken(user._id);

        return res.json({
            success: true,
            token,
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// API to Get Logged-in User Data
export const getUser = async (req, res) => {
    try {
        return res.json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// API to published images 
export const getPublishedImages = async (req, res) => {
    try {
        const publishedImagesMessages = await Chat.aggregate([
            { $unwind: "$messages" },

            {
                $match: {
                    "messages.isImage": true,
                    "messages.isPublished": true
                }
            },

            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName",
                    timestamp: "$messages.timestamp"
                }
            }
        ]);

        return res.json({
            success: true,
            images: publishedImagesMessages.reverse()
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};