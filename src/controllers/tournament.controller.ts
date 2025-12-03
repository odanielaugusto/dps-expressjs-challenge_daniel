import { Request, Response } from 'express';
import tournamentService from '../services/tournament.service';

class TournamentController {
	/**
	 * Create a new tournament
	 * POST /tournaments
	 */
	create(req: Request, res: Response): void {
		try {
			const tournament = tournamentService.createTournament();
			res.status(201).json({
				success: true,
				data: tournament,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				error: error.message || 'Failed to create tournament',
			});
		}
	}

	/**
	 * Get all tournaments
	 * GET /tournaments
	 */
	getAll(req: Request, res: Response): void {
		try {
			const tournaments = tournamentService.getAllTournaments();
			res.status(200).json({
				success: true,
				data: tournaments,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				error: error.message || 'Failed to fetch tournaments',
			});
		}
	}

	/**
	 * Get tournament by ID
	 * GET /tournaments/:id
	 */
	getById(req: Request, res: Response): void {
		try {
			const { id } = req.params;
			const tournament = tournamentService.getTournamentById(id);

			if (!tournament) {
				res.status(404).json({
					success: false,
					error: 'Tournament not found',
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: tournament,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				error: error.message || 'Failed to fetch tournament',
			});
		}
	}

	/**
	 * Add a participant to a tournament
	 * POST /tournaments/:id/participants
	 * Body: { name: string }
	 */
	addParticipant(req: Request, res: Response): void {
		try {
			const { id } = req.params;
			const { name } = req.body;

			// Validate input
			if (!name || typeof name !== 'string' || name.trim() === '') {
				res.status(400).json({
					success: false,
					error: 'Player name is required and must be a non-empty string',
				});
				return;
			}

			const player = tournamentService.addPlayerToTournament(
				id,
				name.trim(),
			);

			res.status(201).json({
				success: true,
				data: player,
				message: `Player '${player.name}' added to tournament`,
			});
		} catch (error: any) {
			// Handle business logic errors with appropriate status codes
			const errorMessage = error.message || 'Failed to add participant';

			if (
				errorMessage.includes('not found') ||
				errorMessage.includes('Not found')
			) {
				res.status(404).json({
					success: false,
					error: errorMessage,
				});
			} else if (
				errorMessage.includes('full') ||
				errorMessage.includes('already in') ||
				errorMessage.includes('Cannot add') ||
				errorMessage.includes('must be in')
			) {
				res.status(400).json({
					success: false,
					error: errorMessage,
				});
			} else {
				res.status(500).json({
					success: false,
					error: errorMessage,
				});
			}
		}
	}

	/**
	 * Start a tournament
	 * PATCH /tournaments/:id/start
	 */
	start(req: Request, res: Response): void {
		try {
			const { id } = req.params;
			const tournament = tournamentService.startTournament(id);

			res.status(200).json({
				success: true,
				data: tournament,
				message: 'Tournament started successfully',
			});
		} catch (error: any) {
			const errorMessage = error.message || 'Failed to start tournament';

			if (
				errorMessage.includes('not found') ||
				errorMessage.includes('Not found')
			) {
				res.status(404).json({
					success: false,
					error: errorMessage,
				});
			} else if (
				errorMessage.includes('already') ||
				errorMessage.includes('Cannot start') ||
				errorMessage.includes('At least')
			) {
				res.status(400).json({
					success: false,
					error: errorMessage,
				});
			} else {
				res.status(500).json({
					success: false,
					error: errorMessage,
				});
			}
		}
	}

	/**
	 * Get tournament leaderboard
	 * GET /tournaments/:id/leaderboard
	 */
	getLeaderboard(req: Request, res: Response): void {
		try {
			const { id } = req.params;
			const leaderboard = tournamentService.getLeaderboard(id);

			res.status(200).json({
				success: true,
				data: leaderboard,
			});
		} catch (error: any) {
			const errorMessage = error.message || 'Failed to fetch leaderboard';

			if (
				errorMessage.includes('not found') ||
				errorMessage.includes('Not found')
			) {
				res.status(404).json({
					success: false,
					error: errorMessage,
				});
			} else {
				res.status(500).json({
					success: false,
					error: errorMessage,
				});
			}
		}
	}

	/**
	 * Post match result
	 * POST /matches/:matchId/result
	 * Body: { scoreA: number, scoreB: number }
	 */
	postMatchResult(req: Request, res: Response): void {
		try {
			const { matchId } = req.params;
			const { scoreA, scoreB } = req.body;

			// Validate input
			if (
				scoreA === undefined ||
				scoreB === undefined ||
				typeof scoreA !== 'number' ||
				typeof scoreB !== 'number'
			) {
				res.status(400).json({
					success: false,
					error: 'Both scoreA and scoreB are required and must be numbers',
				});
				return;
			}

			if (scoreA < 0 || scoreB < 0) {
				res.status(400).json({
					success: false,
					error: 'Scores must be non-negative numbers',
				});
				return;
			}

			const match = tournamentService.recordMatchResult(
				matchId,
				scoreA,
				scoreB,
			);

			res.status(200).json({
				success: true,
				data: match,
				message: 'Match result recorded successfully',
			});
		} catch (error: any) {
			const errorMessage =
				error.message || 'Failed to record match result';

			if (
				errorMessage.includes('not found') ||
				errorMessage.includes('Not found')
			) {
				res.status(404).json({
					success: false,
					error: errorMessage,
				});
			} else if (
				errorMessage.includes('Cannot record') ||
				errorMessage.includes('must be')
			) {
				res.status(400).json({
					success: false,
					error: errorMessage,
				});
			} else {
				res.status(500).json({
					success: false,
					error: errorMessage,
				});
			}
		}
	}
}

export default new TournamentController();
