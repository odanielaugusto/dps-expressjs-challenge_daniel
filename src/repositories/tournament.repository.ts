import { randomUUID } from 'crypto';
import db from '../services/db.service';
import { Tournament, TournamentStatus } from '../models/types';

class TournamentRepository {
	/**
	 * Create a new tournament
	 * @param status - Tournament status (defaults to 'planning')
	 * @returns The created Tournament object
	 */
	create(status: TournamentStatus = 'planning'): Tournament {
		const id = randomUUID();
		const created_at = new Date().toISOString();

		db.run(
			`INSERT INTO tournaments (id, status, created_at) VALUES ($id, $status, $created_at)`,
			{ id, status, created_at },
		);

		return {
			id,
			status,
			created_at,
		};
	}

	/**
	 * Find a tournament by ID
	 * @param id - Tournament ID
	 * @returns Tournament object or undefined if not found
	 */
	findById(id: string): Tournament | undefined {
		const results = db.query(
			`SELECT * FROM tournaments WHERE id = $id`,
			{ id },
		) as Tournament[];

		return results[0];
	}

	/**
	 * Find all tournaments
	 * @returns Array of all tournaments
	 */
	findAll(): Tournament[] {
		return db.query(`SELECT * FROM tournaments`) as Tournament[];
	}

	/**
	 * Update tournament status
	 * @param id - Tournament ID
	 * @param status - New status
	 * @returns Updated tournament or undefined if not found
	 */
	updateStatus(id: string, status: TournamentStatus): Tournament | undefined {
		db.run(`UPDATE tournaments SET status = $status WHERE id = $id`, {
			id,
			status,
		});

		return this.findById(id);
	}
}

export default new TournamentRepository();

