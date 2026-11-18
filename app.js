import express from 'express';
import session from 'express-session';

// Routes
import chatRoutes from './routes/chatRoutes.js';
import beskedRoutes from './routes/beskedRoutes.js';
import brugerRoutes from './routes/brugerRoutes.js';
import forsideRoutes from './routes/forsideRoutes.js';

const app = express();

// Middleware
app.use(express.static('assets'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'udviklingshemmelighed',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

// Pug
app.set('view engine', 'pug');

// Routes
app.use(chatRoutes);
app.use(beskedRoutes);
app.use(brugerRoutes);
app.use(forsideRoutes);

// Start server
app.listen(8010, () => {
    console.log('Serveren kører på port 8010');
});
