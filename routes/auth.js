const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/dummyDb');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (db.users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            id: Date.now().toString(),
            username,
            password: hashedPassword
        };

        db.users.push(user);

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.TOKEN_EXPIRATION
        });

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = db.users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.TOKEN_EXPIRATION
        });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

module.exports = router; 