import express, { Express } from 'express';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		timestamp: new Date().toISOString(),
	});
});

// API routes
app.use('/api', routes);

// Start server
app.listen(port, () => {
	console.log(`🚀 Server ready on port ${port}`);
	console.log(`📍 API available at http://localhost:${port}/api`);
	console.log(`❤️  Health check: http://localhost:${port}/health`);
});
