const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/sectors', require('./routes/sectors'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/letters', require('./routes/letters'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/workspace', require('./routes/workspace'));
app.use('/api/gdrive', require('./routes/gdrive'));
app.use('/api/admin', require('./routes/admin-api'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/surveys', require('./routes/surveys'));
app.use('/api/meeting-notes', require('./routes/meeting-notes'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/wb', require('./routes/whiteboard'));
app.use('/api/feed', require('./routes/feed'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GDRTI Performans sistemi ${PORT} portunda işləyir`));
