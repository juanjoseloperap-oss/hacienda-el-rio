require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/animals', require('./routes/animals'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/movements', require('./routes/movements'));
app.use('/api/health', require('./routes/health'));
app.use('/api/weights', require('./routes/weights'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/reproduction', require('./routes/reproduction'));
app.use('/api/supplies', require('./routes/supplies'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/api/healthcheck', (_, res) => res.json({ ok: true }));
app.use('/', express.static(path.join(__dirname, '../../client')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../../client/index.html')));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));
