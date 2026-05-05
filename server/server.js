// Load .env BEFORE any other imports
import dotenv from 'dotenv';
dotenv.config();

// Now import only modules that DON'T depend on env vars
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamically import modules that depend on environment variables
const { connectDB } = await import('./config/database.js');
const authRoutes = await import('./routes/auth.js').then(m => m.default);
const userRoutes = await import('./routes/users.js').then(m => m.default);
const textRoutes = await import('./routes/texts.js').then(m => m.default);
const quizRoutes = await import('./routes/quiz.js').then(m => m.default);
const journeyRoutes = await import('./routes/journey.js').then(m => m.default);
const { authenticateToken, errorHandler } = await import('./middleware/auth.js').then(m => ({ authenticateToken: m.authenticateToken, errorHandler: m.errorHandler }));

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', process.env.CORS_ORIGIN],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Error handling for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});

// Connect to MongoDB
connectDB();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/texts', textRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/journey', journeyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
