require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const interviewRoutes = require('./routes/interview');
const resumeRoutes = require('./routes/resume');
const dashboardRoutes = require('./routes/dashboard');
const aptitudeRoutes = require('./routes/aptitude');

// Default Route
app.get('/', (req, res) => {
    res.json({ message: 'AI Career Coach API is running!' });
});

app.use('/api/interview', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/aptitude', aptitudeRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
