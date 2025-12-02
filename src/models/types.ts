// Tournament Status Enum
export type TournamentStatus = 'planning' | 'started' | 'finished';

// Tournament Interface
export interface Tournament {
	id: string;
	status: TournamentStatus;
	created_at: string;
}

// Player Interface
export interface Player {
	id: string;
	name: string;
}

// Participant Interface (junction table between tournaments and players)
export interface Participant {
	id: string;
	tournament_id: string;
	player_id: string;
}

// Match Interface
export interface Match {
	id: string;
	tournament_id: string;
	player_a_id: string;
	player_b_id: string;
	score_a: number | null;
	score_b: number | null;
	status: string;
}

