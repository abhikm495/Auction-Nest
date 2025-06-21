import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";

import { connectDB } from './connection.js'
import auctionRouter from './routes/auction.js';
import { secureRoute } from './middleware/auth.js';
import userAuthRouter from './routes/userAuth.js';
import userRouter from './routes/user.js';
import contactRouter from "./routes/contact.js";
import { Server } from 'socket.io';
import { createServer } from 'http'; 
import User from './models/user.js';
import { verifyToken } from './utils/jwt.js';

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));

connectDB();

app.get('/', async (req, res) => {
    res.json({ msg: 'Welcome to Online Auction System API' });
});
app.use('/auth', userAuthRouter)
app.use('/user', secureRoute, userRouter)
app.use('/auction', secureRoute, auctionRouter);
app.use('/contact', contactRouter);

const server = createServer(app);


const io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
});
  
// Helper function to parse cookies
const parseCookies = (cookieString) => {
  const cookies = {};
  if (cookieString) {
    cookieString.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
    });
  }
  return cookies;
};

io.use(async (socket, next) => {
    try {      
      // Parse cookies and extract auth_token
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.auth_token;
      
      if (!token) {
        return next(new Error('Authentication token not found'));
      }
        
      const decoded = verifyToken(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
  
      socket.userId = user._id.toString();
      socket.userName = user.name;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error'));
    }
});

// Helper function to get room users
// Simple approach: Track unique users per auction
const auctionWatchers = new Map(); // auctionId -> Set of userIds
const socketAuctions = new Map(); 
const updateAuctionWatchers = (auctionId, userId, action) => {
  let watchers = auctionWatchers.get(auctionId) || new Set();
  
  if (action === 'add') {
    const wasEmpty = watchers.size === 0;
    watchers.add(userId);
    const isNewUser = !wasEmpty || watchers.size > (wasEmpty ? 0 : watchers.size);
    
    console.log(`User ${userId} watching auction ${auctionId}. Total watchers: ${watchers.size}`);
  } else if (action === 'remove') {
    watchers.delete(userId);
    console.log(`User ${userId} stopped watching auction ${auctionId}. Total watchers: ${watchers.size}`);
  }
  
  auctionWatchers.set(auctionId, watchers);
  
  // Emit updated count to everyone in the auction room
  io.to(`auction_${auctionId}`).emit('watcherCount', {
    count: watchers.size,
    auctionId: auctionId
  });
};

io.on('connection', (socket) => {
  console.log("socket data",socket);
  
  console.log("Socket connected:", socket.id);
  const { userName, userId } = socket;
  console.log(`User ${userName} (${userId}) connected`);

  // Join auction room
  socket.on('joinAuction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`User ${userName} joined auction ${auctionId}`);

    if (!socketAuctions.has(socket.id)) {
      socketAuctions.set(socket.id, new Set());
    }
    socketAuctions.get(socket.id).add(auctionId);
    
    updateAuctionWatchers(auctionId, userId, 'add');
  });

  // Handle check watching request (for initial count)
  socket.on('checkWatching', (auctionId, callback) => {
    const watchers = auctionWatchers.get(auctionId) || new Set();
    if (callback && typeof callback === 'function') {
      callback({ count: watchers.size });
    }
  });

  // Leave auction room
  socket.on('leaveAuction', (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`User ${userName} left auction ${auctionId}`);
    

    if (socketAuctions.has(socket.id)) {
      socketAuctions.get(socket.id).delete(auctionId);
    }

    updateAuctionWatchers(auctionId, userId, 'remove');
  });

  // Handle bid placement
  socket.on('placeBid', (bidData) => {
    socket.to(`auction_${bidData.auctionId}`).emit('newBid', {
      bidAmount: bidData.bidAmount,
      bidder: {
        _id: bidData.bidder._id,
        name: bidData.bidder.name
      },
      bidTime: bidData.bidTime
    });
  });

  // Handle disconnection - remove user from ALL auctions they were in
  socket.on('disconnect', () => {
    console.log(`User ${userName} disconnected:`, socket.id);
    // Only remove from auctions this specific socket was in
    const userAuctions = socketAuctions.get(socket.id) || new Set();
    userAuctions.forEach(auctionId => {
      updateAuctionWatchers(auctionId, userId, 'remove');
    });
  
  // Clean up
  socketAuctions.delete(socket.id);
  });
});

app.set('io', io);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});