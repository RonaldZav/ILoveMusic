const fs = require('fs');
const path = require('path');

const loadEvents = (eventsPath) => {
    const events = {};

    fs.readdirSync(eventsPath).forEach(file => {
        if (file.endsWith('.js')) {
            const event = require(path.join(eventsPath, file));
            events[event.name] = event;
        }
    });

    return events;
};

const eventsPath = path.join(__dirname, 'events');
const events = loadEvents(eventsPath);

module.exports = events;
