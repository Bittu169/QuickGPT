# 🚀 QuickGPT

SmartGPT is a modern AI-powered chatbot platform that allows users to generate text responses, create AI images, manage chat history, and purchase credits through Stripe payments.

Built using React, Node.js, Express, MongoDB, OpenAI, and Stripe.

---

## 🌐 Live Demo

Frontend: https://your-frontend-url.vercel.app

Backend: https://your-backend-url.vercel.app

---

## ✨ Features

### 🤖 AI Chat Assistant
- AI-powered conversations
- Multiple chat sessions
- Chat history management
- Real-time response generation

### 🎨 AI Image Generation
- Generate images using AI
- Image storage and delivery
- Responsive image rendering

### 👤 User Authentication
- User registration
- User login
- JWT authentication
- Secure protected routes

### 💳 Credit System
- Purchase credits through Stripe
- Multiple subscription plans
- Automatic credit updates
- Transaction tracking

### 🌙 Modern UI
- Light mode / Dark mode
- Responsive design
- Markdown rendering
- Syntax highlighted code blocks
- Mobile-friendly interface

### 📂 Chat Management
- Create new chats
- Store conversations in MongoDB
- Persistent chat history

---

# 🛠 Tech Stack

## Frontend

- React 19
- React Router DOM
- Axios
- Tailwind CSS v4
- React Markdown
- PrismJS
- React Hot Toast
- Moment.js
- Vite

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- BcryptJS
- OpenAI API
- Stripe Payment Gateway
- ImageKit
- CORS
- Dotenv

## Database

- MongoDB Atlas

## Deployment

- Vercel (Frontend)
- Vercel (Backend)

---

# 📁 Project Structure

```bash
SmartGPT/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── configs/
│   └── server.js
│
└── README.md
```

---

# ⚙️ Environment Variables

## Backend (.env)

```env
PORT=3000

MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

OPENAI_API_KEY=your_openai_api_key

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## Frontend (.env)

```env
VITE_SERVER_URL=https://your-backend-url.vercel.app
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/smartgpt.git

cd smartgpt
```

---

## Install Frontend

```bash
cd client

npm install

npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## Install Backend

```bash
cd server

npm install

npm run server
```

Backend runs on:

```bash
http://localhost:3000
```

---

# 🔐 Authentication Flow

1. User registers or logs in
2. JWT token is generated
3. Token is stored on frontend
4. Protected APIs validate JWT
5. User gains access to SmartGPT features

---

# 💳 Stripe Payment Flow

1. User selects a credit plan
2. Stripe Checkout Session is created
3. User completes payment
4. Stripe Webhook receives event
5. Transaction is marked as paid
6. Credits are added to user account
7. Updated credits are reflected in UI

---

# 🎨 UI Features

- Responsive Design
- Dark Mode
- Markdown Support
- Syntax Highlighting
- Toast Notifications
- Smooth Navigation

---

# 📸 Screenshots

Add screenshots here:

### Home Page

![Home](screenshots/home.png)

### Chat Interface

![Chat](screenshots/chat.png)

### Pricing Page

![Pricing](screenshots/pricing.png)

---

# 🔮 Future Improvements

- GPT-5 Advanced Models
- Voice Chat Support
- AI File Analysis
- Team Workspaces
- Chat Export Feature
- Usage Analytics
- Multi-language Support

---

# 👨‍💻 Author

Bittu Mondal

GitHub: https://github.com/your-github-username

---

# 📄 License

This project is licensed under the MIT License.

---

⭐ If you like this project, consider giving it a star on GitHub.
