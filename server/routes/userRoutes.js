import express from 'express';
import { getUser, loginUser, registerUser, getPblishedImages } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUser);
userRouter.get('/published-images', getPblishedImages)

export default userRouter;