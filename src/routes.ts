import { Router } from 'express';
import tournamentController from './controllers/tournament.controller';

const router = Router();

// Tournament routes
router.post('/tournaments', (req, res) =>
	tournamentController.create(req, res),
);
router.get('/tournaments', (req, res) => tournamentController.getAll(req, res));
router.get('/tournaments/:id', (req, res) =>
	tournamentController.getById(req, res),
);
router.post('/tournaments/:id/participants', (req, res) =>
	tournamentController.addParticipant(req, res),
);
router.patch('/tournaments/:id/start', (req, res) =>
	tournamentController.start(req, res),
);
router.get('/tournaments/:id/leaderboard', (req, res) =>
	tournamentController.getLeaderboard(req, res),
);

// Match routes
router.post('/matches/:matchId/result', (req, res) =>
	tournamentController.postMatchResult(req, res),
);

export default router;
