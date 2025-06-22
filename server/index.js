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
app.use('/user', secureRoute(true), userRouter)
app.use('/auction', secureRoute(), auctionRouter);
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

// Modified socket authentication - allow guests
io.use(async (socket, next) => {
    try {      
      // Parse cookies and extract auth_token
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.auth_token;
      
      if (!token) {
        // Allow guest users
        socket.isGuest = true;
        socket.userId = `guest_${socket.id}`;
        socket.userName = 'Guest User';
        console.log('Guest user connected:', socket.id);
        return next();
      }
        
      try {
        const decoded = verifyToken(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          // If token is invalid, treat as guest
          socket.isGuest = true;
          socket.userId = `guest_${socket.id}`;
          socket.userName = 'Guest User';
          console.log('Invalid token, treating as guest:', socket.id);
          return next();
        }

        // Authenticated user
        socket.isGuest = false;
        socket.userId = user._id.toString();
        socket.userName = user.name;
        console.log('Authenticated user connected:', socket.userName, socket.userId);
        next();
      } catch (authError) {
        // If authentication fails, treat as guest
        socket.isGuest = true;
        socket.userId = `guest_${socket.id}`;
        socket.userName = 'Guest User';
        console.log('Auth error, treating as guest:', socket.id);
        next();
      }
    } catch (error) {
      console.error('Socket auth error:', error);
      // Even on error, allow as guest
      socket.isGuest = true;
      socket.userId = `guest_${socket.id}`;
      socket.userName = 'Guest User';
      next();
    }
});

// Updated tracking maps
const auctionWatchers = new Map(); // auctionId -> Set of socketIds
const socketAuctions = new Map(); // socketId -> Set of auctionIds

const updateAuctionWatchers = (auctionId, socketId, action) => {
  let watchers = auctionWatchers.get(auctionId) || new Set();
  
  if (action === 'add') {
    const wasEmpty = watchers.size === 0;
    watchers.add(socketId);
    
    console.log(`Socket ${socketId} watching auction ${auctionId}. Total watchers: ${watchers.size}`);
  } else if (action === 'remove') {
    watchers.delete(socketId);
    console.log(`Socket ${socketId} stopped watching auction ${auctionId}. Total watchers: ${watchers.size}`);
    
    // Clean up empty sets
    if (watchers.size === 0) {
      auctionWatchers.delete(auctionId);
    } else {
      auctionWatchers.set(auctionId, watchers);
    }
  }
  
  if (watchers.size > 0) {
    auctionWatchers.set(auctionId, watchers);
  }
  
  // Emit updated count to everyone in the auction room
  io.to(`auction_${auctionId}`).emit('watcherCount', {
    count: watchers.size,
    auctionId: auctionId
  });
};

io.on('connection', (socket) => {
  console.log("Socket connected:", socket.id);
  const { userName, userId, isGuest } = socket;
  console.log(`User ${userName} (${userId}) connected. Guest: ${isGuest}`);

  // Join auction room
  socket.on('joinAuction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`User ${userName} joined auction ${auctionId}`);

    // Track socket auctions
    if (!socketAuctions.has(socket.id)) {
      socketAuctions.set(socket.id, new Set());
    }
    socketAuctions.get(socket.id).add(auctionId);
    
    // Update watchers count using socketId
    updateAuctionWatchers(auctionId, socket.id, 'add');
  });

  // Handle leave auction
  socket.on('leaveAuction', (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`User ${userName} left auction ${auctionId}`);

    // Remove from tracking
    const userAuctions = socketAuctions.get(socket.id);
    if (userAuctions) {
      userAuctions.delete(auctionId);
      if (userAuctions.size === 0) {
        socketAuctions.delete(socket.id);
      }
    }
    
    updateAuctionWatchers(auctionId, socket.id, 'remove');
  });

  // Handle check watching request (for initial count)
  socket.on('checkWatching', (auctionId, callback) => {
    const watchers = auctionWatchers.get(auctionId) || new Set();
    if (callback && typeof callback === 'function') {
      callback({ count: watchers.size });
    }
  });

  // Handle bid placement - only for authenticated users
  socket.on('placeBid', (bidData) => {
    if (isGuest) {
      socket.emit('bidError', { 
        message: 'You must be logged in to place bids',
        requiresAuth: true 
      });
      return;
    }

    // Broadcast to other users in the auction room
    socket.to(`auction_${bidData.auctionId}`).emit('newBid', {
      bidAmount: bidData.bidAmount,
      bidder: {
        _id: bidData.bidder._id,
        name: bidData.bidder.name
      },
      bidTime: bidData.bidTime
    });
  });

  socket.on('disconnect', () => {
    console.log(`User ${userName} disconnected:`, socket.id);
    
    // Remove from all auctions this socket was watching
    const userAuctions = socketAuctions.get(socket.id) || new Set();
    userAuctions.forEach(auctionId => {
      updateAuctionWatchers(auctionId, socket.id, 'remove');
    });
  
    // Clean up
    socketAuctions.delete(socket.id);
  });
});

app.set('io', io);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});