const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

function configureMiddleware(app) {
  // Trust first proxy for correct client IP detection behind proxies
  app.set('trust proxy', 1);

  // Security and performance middleware
  app.use(helmet());
  app.use(compression());

  // Configure CORS
  let corsOptions;
  if (process.env.CORS_ORIGIN) {
    const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    corsOptions = {
      origin: (requestOrigin, callback) => {
        if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    };
  } else {
    corsOptions = {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: false
    };
  }
  app.use(cors(corsOptions));

  // Body parsers and cookie parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(cookieParser());

  // Request logging
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Rate limiting for /api routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api', apiLimiter);
}

function initServer() {
  const app = express();
  configureMiddleware(app);

  // Load API routes
  try {
    const apiRouter = require('./routes/api');
    app.use('/api', apiRouter);
  } catch (err) {
    console.error('Failed to load API router:', err);
    process.exit(1);
  }

  // Serve static React build
  const buildPath = path.resolve(__dirname, 'build');
  app.use(express.static(buildPath));

  // Handle unknown API routes
  app.get('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // Serve index.html for all other routes (client-side routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  // Start server
  const port = parseInt(process.env.PORT, 10) || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

initServer();