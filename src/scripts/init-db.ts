import db from '../services/db.service';

console.log('🚀 Initializing Tournament System Database Schema...\n');

try {
	// Create tournaments table
	db.run(`
		CREATE TABLE IF NOT EXISTS tournaments (
			id TEXT PRIMARY KEY,
			status TEXT NOT NULL CHECK(status IN ('planning', 'started', 'finished')) DEFAULT 'planning',
			created_at TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);
	console.log('✅ Table "tournaments" created successfully');

	// Create players table
	db.run(`
		CREATE TABLE IF NOT EXISTS players (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL
		)
	`);
	console.log('✅ Table "players" created successfully');

	// Create participants table (junction table for tournaments and players)
	db.run(`
		CREATE TABLE IF NOT EXISTS participants (
			id TEXT PRIMARY KEY,
			tournament_id TEXT NOT NULL,
			player_id TEXT NOT NULL,
			FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
			FOREIGN KEY(player_id) REFERENCES players(id),
			UNIQUE(tournament_id, player_id)
		)
	`);
	console.log('✅ Table "participants" created successfully');

	// Create matches table
	db.run(`
		CREATE TABLE IF NOT EXISTS matches (
			id TEXT PRIMARY KEY,
			tournament_id TEXT NOT NULL,
			player_a_id TEXT NOT NULL,
			player_b_id TEXT NOT NULL,
			score_a INTEGER DEFAULT NULL,
			score_b INTEGER DEFAULT NULL,
			status TEXT DEFAULT 'pending',
			FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
			FOREIGN KEY(player_a_id) REFERENCES players(id),
			FOREIGN KEY(player_b_id) REFERENCES players(id)
		)
	`);
	console.log('✅ Table "matches" created successfully');

	console.log('\n🎉 Database schema initialized successfully!');
	console.log('\nTournament System Tables:');
	console.log('  - tournaments (id, status, created_at)');
	console.log('  - players (id, name)');
	console.log('  - participants (id, tournament_id, player_id)');
	console.log(
		'  - matches (id, tournament_id, player_a_id, player_b_id, score_a, score_b, status)',
	);
} catch (error) {
	console.error('❌ Error initializing database schema:', error);
	process.exit(1);
}

process.exit(0);
