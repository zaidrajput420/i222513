const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db/dummyDb');
const reminderService = require('../services/reminderService');

router.post('/', auth, (req, res) => {
    try {
        const { name, description, date, time, category, reminder } = req.body;
        
        const event = {
            id: Date.now().toString(),
            userId: req.user.id,
            name,
            description,
            date,
            time,
            category,
            reminder,
            createdAt: new Date().toISOString()
        };

        db.events.push(event);
        
        if (reminder) {
            reminderService.scheduleReminder(event);
        }

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: 'Error creating event' });
    }
});

// Get all events for a user
router.get('/', auth, (req, res) => {
    try {
        const { sort, category, reminderStatus } = req.query;
        let events = db.events.filter(event => event.userId === req.user.id);

        if (category) {
            events = events.filter(event => event.category === category);
        }

        // Filter by reminder status
        if (reminderStatus) {
            events = events.filter(event => !!event.reminder === (reminderStatus === 'true'));
        }

        // Sort events
        if (sort === 'date') {
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sort === 'category') {
            events.sort((a, b) => a.category.localeCompare(b.category));
        }

        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching events' });
    }
});
router.get('/:id', auth, (req, res) => {
    try {
        const event = db.events.find(
            e => e.id === req.params.id && e.userId === req.user.id
        );

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching event' });
    }
});

// Update event
router.put('/:id', auth, (req, res) => {
    try {
        const eventIndex = db.events.findIndex(
            e => e.id === req.params.id && e.userId === req.user.id
        );

        if (eventIndex === -1) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const updatedEvent = {
            ...db.events[eventIndex],
            ...req.body,
            id: req.params.id,
            userId: req.user.id
        };

        db.events[eventIndex] = updatedEvent;
        
        if (updatedEvent.reminder) {
            reminderService.scheduleReminder(updatedEvent);
        } else {
            reminderService.cancelReminder(updatedEvent.id);
        }

        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: 'Error updating event' });
    }
});

// Delete event
router.delete('/:id', auth, (req, res) => {
    try {
        const eventIndex = db.events.findIndex(
            e => e.id === req.params.id && e.userId === req.user.id
        );

        if (eventIndex === -1) {
            return res.status(404).json({ error: 'Event not found' });
        }

        reminderService.cancelReminder(db.events[eventIndex].id);
        db.events.splice(eventIndex, 1);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting event' });
    }
});

// Get available categories
router.get('/categories/list', auth, (req, res) => {
    try {
        res.json(db.categories);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching categories' });
    }
});

module.exports = router; 