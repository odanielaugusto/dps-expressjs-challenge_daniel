 import { randomUUID } from 'crypto';
import db from '../services/db.service';
import { Participant } from '../models/types';

class ParticipantRepository {
	/**
	 * Add a participant to a tournament
	 * @param tournament_id - Tournament ID
	 * @param player_id - Player ID
	 * @returns The created Participant object
	 */
	add(tournament_id: string, player_id: string): Participant {
		const id = randomUUID();

		db.run(
			`INSERT INTO participants (id, tournament_id, player_id) VALUES ($id, $tournament_id, $player_id)`,
			{ id, tournament_id, player_id },
		);

		return {
			id,
			tournament_id,
			player_id,
		};
	}

	/**
	 * Find all participants for a tournament
	 * @param tournament_id - Tournament ID
	 * @returns Array of participants
	 */
	findByTournamentId(tournament_id: string): Participant[] {
		return db.query(
			`SELECT * FROM participants WHERE tournament_id = $tournament_id`,
			{ tournament_id },
		) as Participant[];
	}

	/**
	 * Count participants in a tournament
	 * @param tournament_id - Tournament ID
	 * @returns Number of participants
	 */
	countByTournamentId(tournament_id: string): number {
		const result = db.query(
			`SELECT COUNT(*) as count FROM participants WHERE tournament_id = $tournament_id`,
			{ tournament_id },
		) as [{ count: number }];

		return result[0].count;
	}

	/**
	 * Check if a player is already in a tournament
	 * @param tournament_id - Tournament ID
	 * @param player_id - Player ID
	 * @returns true if player is already a participant
	 */
	exists(tournament_id: string, player_id: string): boolean {
		const result = db.query(
			`SELECT COUNT(*) as count FROM participants WHERE tournament_id = $tournament_id AND player_id = $player_id`,
			{ tournament_id, player_id },
		) as [{ count: number }];

		return result[0].count > 0;
	}

	/**
	 * Find all participants
	 * @returns Array of all participants
	 */
	findAll(): Participant[] {
		return db.query(`SELECT * FROM participants`) as Participant[];
	}
}

export default new ParticipantRepository();

