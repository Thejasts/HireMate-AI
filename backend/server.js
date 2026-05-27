require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Secure HTTP headers
app.use(xss()); // Prevent XSS by sanitizing req.body, req.query, req.params

// Secure CORS - Only allow frontend origin in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? 'https://yourproductiondomain.com' : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Standard Middleware
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent payload exhaustion
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Global Rate Limiting (Protects all routes from DDoS)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use('/api/', globalLimiter);

// Aggressive Rate Limiting for AI/Gemini endpoints
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 AI requests per minute
  message: 'AI request limit reached. Please wait a minute.'
});

// Routes
const interviewRoutes = require('./routes/interview');
const resumeRoutes = require('./routes/resume');
const dashboardRoutes = require('./routes/dashboard');
const aptitudeRoutes = require('./routes/aptitude');
const gdRoutes = require('./routes/gd');

// Default Route
app.get('/', (req, res) => {
    res.json({ message: 'AI Career Coach API is running securely!' });
});

app.use('/api/interview', aiLimiter, interviewRoutes);
app.use('/api/resume', aiLimiter, resumeRoutes);
app.use('/api/dashboard', dashboardRoutes); // Dashboard doesn't hit Gemini directly, standard limits apply
app.use('/api/aptitude', aiLimiter, aptitudeRoutes);
app.use('/api/gd', aiLimiter, gdRoutes); // GD makes rapid calls, 20/min is decent

// Global Error Handling Middleware (Hides Stack Traces)
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.message);
    res.status(err.status || 500).json({ 
        error: 'An unexpected error occurred. Please try again later.' 
        // DO NOT send err.stack in production
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running securely on port ${PORT}`);
});
