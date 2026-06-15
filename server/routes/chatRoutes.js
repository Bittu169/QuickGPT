import express from 'express';
import { createchat, deleteChats, getChats } from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';

const chatRouter = express.Router();

chatRouter.get('/create',protect, createchat)
chatRouter.get('/get',protect, getChats)
chatRouter.post('/delete',protect, deleteChats)

export default chatRouter;