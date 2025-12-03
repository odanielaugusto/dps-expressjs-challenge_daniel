import tournamentRepository from '../repositories/tournament.repository';
import playerRepository from '../repositories/player.repository';
import participantRepository from '../repositories/participant.repository';
import matchRepository from '../repositories/match.repository';
import { Tournament, Player, Match } from '../models/types';

class TournamentService {
	/**
	 * Create a new tournament
	 * @returns The created tournament
	 */
	createTournament(): Tournament {
		return tournamentRepository.create('planning');
	}

	/**
	 * Get all tournaments
	 * @returns Array of all tournaments
	 */
	getAllTournaments(): Tournament[] {
		return tournamentRepository.findAll();
	}

	/**
	 * Get a tournament by ID
	 * @param tournamentId - Tournament ID
	 * @returns Tournament or undefined if not found
	 */
	getTournamentById(tournamentId: string): Tournament | undefined {
		return tournamentRepository.findById(tournamentId);
	}

	/**
	 * Add a player to a tournament
	 * Business rules:
	 * - Tournament must be in 'planning' status
	 * - Tournament must have fewer than 5 participants
	 * - If player name doesn't exist, create player on the fly
	 * - Player cannot be added twice to the same tournament
	 *
	 * @param tournamentId - Tournament ID
	 * @param playerName - Player name
	 * @returns The player that was added
	 * @throws Error if validation fails
	 */
	addPlayerToTournament(tournamentId: string, playerName: string): Player {
		// 1. Verify tournament exists and is in planning mode
		const tournament = tournamentRepository.findById(tournamentId);
		if (!tournament) {
			throw new Error('Tournament not found');
		}

		if (tournament.status !== 'planning') {
			throw new Error(
				`Cannot add players to a tournament in '${tournament.status}' status. Tournament must be in 'planning' status.`,
			);
		}

		// 2. Check participant count (max 5 players)
		const participantCount =
			participantRepository.countByTournamentId(tournamentId);
		if (participantCount >= 5) {
			throw new Error(
				'Tournament is full. Maximum 5 participants allowed.',
			);
		}

		// 3. Find or create player
		let player = playerRepository.findByName(playerName);
		if (!player) {
			player = playerRepository.create(playerName);
		}

		// 4. Check if player is already in the tournament
		if (participantRepository.exists(tournamentId, player.id)) {
			throw new Error(
				`Player '${playerName}' is already in this tournament`,
			);
		}

		// 5. Add player to tournament
		participantRepository.add(tournamentId, player.id);

		return player;
	}

	/**
	 * Start a tournament
	 * Business rules:
	 * - Tournament must be in 'planning' status
	 * - Must have at least 2 players
	 * - Generates all round-robin matches
	 * - Changes status to 'started'
	 *
	 * @param tournamentId - Tournament ID
	 * @returns The updated tournament
	 * @throws Error if validation fails
	 */
	startTournament(tournamentId: string): Tournament {
		// 1. Verify tournament exists and is in planning mode
		const tournament = tournamentRepository.findById(tournamentId);
		if (!tournament) {
			throw new Error('Tournament not found');
		}

		if (tournament.status !== 'planning') {
			throw new Error(
				`Tournament is already ${tournament.status}. Can only start tournaments in 'planning' status.`,
			);
		}

		// 2. Check minimum player requirement (at least 2)
		const participants =
			participantRepository.findByTournamentId(tournamentId);
		if (participants.length < 2) {
			throw new Error(
				'Cannot start tournament. At least 2 players required.',
			);
		}

		// 3. Generate round-robin matches (each player plays every other player once)
		for (let i = 0; i < participants.length; i++) {
			for (let j = i + 1; j < participants.length; j++) {
				matchRepository.create(
					tournamentId,
					participants[i].player_id,
					participants[j].player_id,
				);
			}
		}

		// 4. Update tournament status to 'started'
		const updatedTournament = tournamentRepository.updateStatus(
			tournamentId,
			'started',
		);

		if (!updatedTournament) {
			throw new Error('Failed to update tournament status');
		}

		return updatedTournament;
	}

	/**
	 * Record a match result
	 * Business rules:
	 * - Match must exist
	 * - Tournament must be in 'started' status
	 * - Updates match scores
	 * - If no pending matches remain, finish the tournament
	 *
	 * @param matchId - Match ID
	 * @param scoreA - Score for player A
	 * @param scoreB - Score for player B
	 * @returns The updated match
	 * @throws Error if validation fails
	 */
	recordMatchResult(matchId: string, scoreA: number, scoreB: number): Match {
		// 1. Verify match exists
		const match = matchRepository.findById(matchId);
		if (!match) {
			throw new Error('Match not found');
		}

		// 2. Verify tournament is in 'started' status
		const tournament = tournamentRepository.findById(match.tournament_id);
		if (!tournament) {
			throw new Error('Tournament not found');
		}

		if (tournament.status !== 'started') {
			throw new Error(
				`Cannot record results. Tournament is ${tournament.status}.`,
			);
		}

		// 3. Validate scores (must be non-negative)
		if (scoreA < 0 || scoreB < 0) {
			throw new Error('Scores must be non-negative numbers');
		}

		// 4. Update match scores
		const updatedMatch = matchRepository.updateScores(
			matchId,
			scoreA,
			scoreB,
		);

		if (!updatedMatch) {
			throw new Error('Failed to update match scores');
		}

		// 5. Check if all matches are complete
		const pendingMatches = matchRepository.countPendingByTournamentId(
			match.tournament_id,
		);

		// 6. If no pending matches, finish the tournament
		if (pendingMatches === 0) {
			tournamentRepository.updateStatus(match.tournament_id, 'finished');
		}

		return updatedMatch;
	}

	/**
	 * Get tournament leaderboard with points calculated
	 * Points: Win = 2, Draw = 1, Loss = 0
	 *
	 * @param tournamentId - Tournament ID
	 * @returns Leaderboard with player info and points
	 */
	getLeaderboard(tournamentId: string) {
		// 1. Get tournament
		const tournament = tournamentRepository.findById(tournamentId);
		if (!tournament) {
			throw new Error('Tournament not found');
		}

		// 2. Get all participants
		const participants =
			participantRepository.findByTournamentId(tournamentId);

		// 3. Get all matches
		const matches = matchRepository.findByTournamentId(tournamentId);

		// 4. Calculate points for each player
		const leaderboard = participants.map((participant) => {
			const player = playerRepository.findById(participant.player_id);
			if (!player) {
				throw new Error(`Player ${participant.player_id} not found`);
			}

			let points = 0;
			let played = 0;
			let wins = 0;
			let draws = 0;
			let losses = 0;

			// Calculate points from matches
			matches.forEach((match) => {
				if (match.score_a === null || match.score_b === null) {
					return; // Skip pending matches
				}

				const isPlayerA = match.player_a_id === player.id;
				const isPlayerB = match.player_b_id === player.id;

				if (!isPlayerA && !isPlayerB) {
					return; // Player not in this match
				}

				played++;

				if (match.score_a === match.score_b) {
					// Draw
					points += 1;
					draws++;
				} else if (
					(isPlayerA && match.score_a > match.score_b) ||
					(isPlayerB && match.score_b > match.score_a)
				) {
					// Win
					points += 2;
					wins++;
				} else {
					// Loss
					losses++;
				}
			});

			return {
				player_id: player.id,
				player_name: player.name,
				points,
				played,
				wins,
				draws,
				losses,
			};
		});

		// 5. Sort by points (descending)
		leaderboard.sort((a, b) => b.points - a.points);

		return {
			tournament_id: tournamentId,
			status: tournament.status,
			created_at: tournament.created_at,
			leaderboard,
		};
	}
}

export default new TournamentService();
