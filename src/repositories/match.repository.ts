import { randomUUID } from 'crypto';
import db from '../services/db.service';
import { Match } from '../models/types';

class MatchRepository {
	/**
	 * Create a new match
	 * @param tournament_id - Tournament ID
	 * @param player_a_id - First player ID
	 * @param player_b_id - Second player ID
	 * @returns The created Match object
	 */
	create(
		tournament_id: string,
		player_a_id: string,
		player_b_id: string,
	): Match {
		const id = randomUUID();

		db.run(
			`INSERT INTO matches (id, tournament_id, player_a_id, player_b_id, score_a, score_b, status) 
			VALUES ($id, $tournament_id, $player_a_id, $player_b_id, NULL, NULL, 'pending')`,
			{ id, tournament_id, player_a_id, player_b_id },
		);

		return {
			id,
			tournament_id,
			player_a_id,
			player_b_id,
			score_a: null,
			score_b: null,
			status: 'pending',
		};
	}

	/**
	 * Update match scores
	 * @param match_id - Match ID
	 * @param score_a - Score for player A
	 * @param score_b - Score for player B
	 * @returns Updated Match object or undefined if not found
	 */
	updateScores(
		match_id: string,
		score_a: number,
		score_b: number,
	): Match | undefined {
		db.run(
			`UPDATE matches SET score_a = $score_a, score_b = $score_b, status = 'completed' WHERE id = $match_id`,
			{ match_id, score_a, score_b },
		);

		return this.findById(match_id);
	}

	/**
	 * Find a match by ID
	 * @param id - Match ID
	 * @returns Match object or undefined if not found
	 */
	findById(id: string): Match | undefined {
		const results = db.query(
			`SELECT * FROM matches WHERE id = $id`,
			{ id },
		) as Match[];

		return results[0];
	}

	/**
	 * Find all matches for a tournament
	 * @param tournament_id - Tournament ID
	 * @returns Array of matches
	 */
	findByTournamentId(tournament_id: string): Match[] {
		return db.query(
			`SELECT * FROM matches WHERE tournament_id = $tournament_id`,
			{ tournament_id },
		) as Match[];
	}

	/**
	 * Count pending matches in a tournament
	 * @param tournament_id - Tournament ID
	 * @returns Number of pending matches
	 */
	countPendingByTournamentId(tournament_id: string): number {
		const result = db.query(
			`SELECT COUNT(*) as count FROM matches WHERE tournament_id = $tournament_id AND status = 'pending'`,
			{ tournament_id },
		) as [{ count: number }];

		return result[0].count;
	}

	/**
	 * Find all matches
	 * @returns Array of all matches
	 */
	findAll(): Match[] {
		return db.query(`SELECT * FROM matches`) as Match[];
	}
}

export default new MatchRepository();

