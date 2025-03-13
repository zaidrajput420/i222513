require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const reminderService = require('./services/reminderService');

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        reminderService.rescheduleAllReminders();
    });
}

module.exports = app; 