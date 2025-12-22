# Online Polling and Voting System

A full-stack web application for creating polls, voting, and viewing real-time results. Built with React and Node.js/Express, featuring MongoDB for data persistence.

## 🚀 Features

- **Create Polls**: Easily create polls with custom questions and multiple options
- **Vote**: Cast votes on any poll with real-time vote counting
- **Real-time Updates**: Automatic refresh of poll results every 3 seconds
- **Anonymous Voting**: Support for both anonymous and non-anonymous voting modes
- **Poll Management**: View all polls, see detailed results, and delete polls
- **Responsive Design**: Clean and modern UI built with React

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.3 - UI library
- **React Scripts** 5.0.1 - Build tooling
- **CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express** 4.19.0 - Web framework
- **MongoDB** with **Mongoose** 8.0.0 - Database and ODM
- **CORS** 2.8.5 - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd LPU
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ../..
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `backend` directory (optional for local development):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/polling_app
```

For production or MongoDB Atlas, set:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/polling_app
```

**Note**: If `MONGODB_URI` is not set, the application defaults to `mongodb://127.0.0.1:27017/polling_app`.

## 🏃 Running the Application

### Development Mode

1. **Start MongoDB** (if using local MongoDB)
   ```bash
   # On Windows
   mongod

   # On macOS/Linux
   sudo systemctl start mongod
   # or
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5000`

3. **Start the frontend** (in a new terminal)
   ```bash
   cd backend/client
   npm start
   ```
   The frontend will open at `http://localhost:3000`

### Production Build

1. **Build the frontend**
   ```bash
   cd backend/client
   npm run build
   ```

2. **Start the backend** (serves the built frontend)
   ```bash
   cd backend
   npm start
   ```

## 📁 Project Structure

```
LPU/
├── backend/
│   ├── client/              # React frontend application
│   │   ├── public/         # Static files
│   │   ├── src/            # React source code
│   │   ├── build/          # Production build (generated)
│   │   ├── package.json    # Frontend dependencies
│   │   └── vercel.json     # Vercel deployment config
│   ├── server.js           # Express backend server
│   ├── package.json        # Backend dependencies
│   └── Procfile            # Heroku/Railway deployment config
├── frontend/               # Alternative frontend (if used)
├── deploy.sh              # Deployment script
└── README.md              # This file
```

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Get All Polls
```http
GET /api/polls
```
**Response**: Array of all polls

#### Get Single Poll
```http
GET /api/polls/:id
```
**Response**: Poll object with question, options, and vote counts

#### Create Poll
```http
POST /api/polls
Content-Type: application/json

{
  "question": "What is your favorite programming language?",
  "options": ["JavaScript", "Python", "Java", "C++"],
  "allowAnonymous": true
}
```
**Response**: Created poll object

#### Vote on Poll
```http
POST /api/polls/:id/vote
Content-Type: application/json

{
  "optionIndex": 0,
  "userName": "John" // Optional if allowAnonymous is true
}
```
**Response**: Updated poll object with new vote counts

#### Clear Vote
```http
POST /api/polls/:id/clear-vote
Content-Type: application/json

{
  "optionIndex": 0,
  "userName": "John" // Optional if allowAnonymous is true
}
```
**Response**: Updated poll object with decremented vote count

#### Delete Poll
```http
DELETE /api/polls/:id
```
**Response**: Success message

## 🚢 Deployment

### Using the Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment

#### Backend (Railway/Render/Heroku)

1. **Railway/Render**
   - Connect your GitHub repository
   - Set environment variable: `MONGODB_URI`
   - Set build command: `npm install`
   - Set start command: `npm start`

2. **Heroku**
   ```bash
   heroku create your-app-name
   heroku config:set MONGODB_URI=your_mongodb_uri
   git push heroku main
   ```

#### Frontend (Vercel/Netlify)

1. **Vercel**
   - Connect your GitHub repository
   - Set root directory to `backend/client`
   - Vercel will auto-detect React and deploy

2. **Netlify**
   - Connect your GitHub repository
   - Set build command: `cd backend/client && npm install && npm run build`
   - Set publish directory: `backend/client/build`

### Environment Variables for Production

Make sure to set:
- `MONGODB_URI` - Your MongoDB connection string
- `PORT` - Server port (usually auto-set by hosting platform)

## 🧪 Testing

Run frontend tests:
```bash
cd backend/client
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

Your Name / Your Organization

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- MongoDB for the flexible database solution

---

**Note**: This is a demo application. For production use, consider adding:
- User authentication and authorization
- Rate limiting
- Input validation and sanitization
- Error logging and monitoring
- HTTPS enforcement
- More robust vote tracking (prevent duplicate votes)
