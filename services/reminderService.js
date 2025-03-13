const schedule = require('node-schedule');
const db = require('../db/dummyDb');

const scheduleMap = new Map();

const calculateReminderTime = (eventDate, eventTime, reminder) => {
    const [hours, minutes] = eventTime.split(':');
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(parseInt(hours), parseInt(minutes));

    const reminderTime = new Date(eventDateTime);
    switch(reminder.unit) {
        case 'minutes':
            reminderTime.setMinutes(reminderTime.getMinutes() - reminder.time);
            break;
        case 'hours':
            reminderTime.setHours(reminderTime.getHours() - reminder.time);
            break;
        case 'days':
            reminderTime.setDate(reminderTime.getDate() - reminder.time);
            break;
    }
    return reminderTime;
};

const scheduleReminder = (event) => {
    if (!event.reminder || !event.date || !event.time) return;

    const reminderTime = calculateReminderTime(event.date, event.time, event.reminder);
    if (reminderTime <= new Date()) return;

    const job = schedule.scheduleJob(reminderTime, () => {
        console.log(`REMINDER: Event "${event.name}" is coming up at ${event.time} on ${event.date}`);
        const user = db.users.find(u => u.id === event.userId);
        if (user) {
            sendNotification(user, event);
        }
    });

    if (scheduleMap.has(event.id)) {
        scheduleMap.get(event.id).cancel();
    }
    scheduleMap.set(event.id, job);
};

const cancelReminder = (eventId) => {
    if (scheduleMap.has(eventId)) {
        scheduleMap.get(eventId).cancel();
        scheduleMap.delete(eventId);
    }
};

const sendNotification = (user, event) => {
    console.log(`Sending notification to user ${user.username} for event: ${event.name}`);
};

const rescheduleAllReminders = () => {
    db.events.forEach(event => {
        if (event.reminder) {
            scheduleReminder(event);
        }
    });
};

module.exports = {
    scheduleReminder,
    cancelReminder,
    rescheduleAllReminders
}; 