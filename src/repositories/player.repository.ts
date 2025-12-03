import { randomUUID } from 'crypto';
import db from '../services/db.service';
import { Player } from '../models/types';

class PlayerRepository {
	/**
	 * Create a new player
	 * @param name - Player name
	 * @returns The created Player object
	 */
	create(name: string): Player {
		const id = randomUUID();

		db.run(`INSERT INTO players (id, name) VALUES ($id, $name)`, {
			id,
			name,
		});

		return {
			id,
			name,
		};
	}

	/**
	 * Find a player by ID
	 * @param id - Player ID
	 * @returns Player object or undefined if not found
	 */
	findById(id: string): Player | undefined {
		const results = db.query(`SELECT * FROM players WHERE id = $id`, {
			id,
		}) as Player[];

		return results[0];
	}

	/**
	 * Find all players
	 * @returns Array of all players
	 */
	findAll(): Player[] {
		return db.query(`SELECT * FROM players`) as Player[];
	}

	/**
	 * Find a player by name
	 * @param name - Player name
	 * @returns Player object or undefined if not found
	 */
	findByName(name: string): Player | undefined {
		const results = db.query(`SELECT * FROM players WHERE name = $name`, {
			name,
		}) as Player[];

		return results[0];
	}
}

export default new PlayerRepository();
