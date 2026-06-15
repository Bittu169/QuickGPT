import axios from "axios";
import openai from "../configs/openai.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";

// Text-based AI Chat Message Controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check Credits
        if (req.user.credits < 1) {
            return res.json({
                success: false,
                message: "You don't have enough credits to use this feature",
            });
        }

        const { chatId, prompt } = req.body;

        const chat = await Chat.findOne({
            userId,
            _id: chatId,
        });

        if (!chat) {
            return res.json({
                success: false,
                message: "Chat not found",
            });
        }

        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false,
        });

        const completion = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const reply = {
            ...completion.choices[0].message,
            timestamp: Date.now(),
            isImage: false,
        };

        chat.messages.push(reply);

        await chat.save();

        await User.updateOne(
            { _id: userId },
            { $inc: { credits: -1 } }
        );

        return res.json({
            success: true,
            reply,
        });

    } catch (error) {
        console.error(error);

        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// Image Generation Message Controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check Credits
        if (req.user.credits < 2) {
            return res.json({
                success: false,
                message: "You don't have enough credits to use this feature",
            });
        }

        const { prompt, chatId, isPublished } = req.body;

        const chat = await Chat.findOne({
            userId,
            _id: chatId,
        });

        if (!chat) {
            return res.json({
                success: false,
                message: "Chat not found",
            });
        }

        // Store user prompt
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false,
        });

        const encodedPrompt = encodeURIComponent(prompt);

        const generatedImageUrl =
            `${process.env.IMAGEKIT_URL_ENDPOINT}` +
            `/ik-genimg-prompt-${encodedPrompt}` +
            `/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

        const aiImageResponse = await axios.get(generatedImageUrl, {
            responseType: "arraybuffer",
        });

        const base64Image =
            `data:image/png;base64,${Buffer.from(
                aiImageResponse.data
            ).toString("base64")}`;

        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt",
        });

        const reply = {
            role: "assistant",
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished,
        };

        chat.messages.push(reply);

        await chat.save();

        await User.updateOne(
            { _id: userId },
            { $inc: { credits: -2 } }
        );

        return res.json({
            success: true,
            reply,
        });

    } catch (error) {
        console.error(error);

        return res.json({
            success: false,
            message: error.message,
        });
    }
};