# Tournament REST API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Create Tournament
Create a new tournament in 'planning' status.

**Endpoint:** `POST /tournaments`

**Request Body:** None

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "planning",
    "created_at": "2025-11-29T17:33:23.343Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/tournaments \
  -H "Content-Type: application/json"
```

---

### 2. Get All Tournaments
Retrieve all tournaments.

**Endpoint:** `GET /tournaments`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "planning|started|finished",
      "created_at": "2025-11-29T17:33:23.343Z"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/tournaments
```

---

### 3. Get Tournament by ID
Retrieve a specific tournament.

**Endpoint:** `GET /tournaments/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "planning",
    "created_at": "2025-11-29T17:33:23.343Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": "Tournament not found"
}
```

**Example:**
```bash
curl http://localhost:3000/api/tournaments/{tournament-id}
```

---

### 4. Add Participant
Add a player to a tournament. If the player doesn't exist, they will be created automatically.

**Endpoint:** `POST /tournaments/:id/participants`

**Request Body:**
```json
{
  "name": "Player Name"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Player Name"
  },
  "message": "Player 'Player Name' added to tournament"
}
```

**Error Responses:**

- `400 Bad Request` - Tournament full (max 5 players)
```json
{
  "success": false,
  "error": "Tournament is full. Maximum 5 participants allowed."
}
```

- `400 Bad Request` - Tournament not in planning status
```json
{
  "success": false,
  "error": "Cannot add players to a tournament in 'started' status. Tournament must be in 'planning' status."
}
```

- `400 Bad Request` - Duplicate player
```json
{
  "success": false,
  "error": "Player 'Player Name' is already in this tournament"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/tournaments/{tournament-id}/participants \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice"}'
```

---

### 5. Start Tournament
Start a tournament and generate all round-robin matches.

**Endpoint:** `PATCH /tournaments/:id/start`

**Request Body:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "started",
    "created_at": "2025-11-29T17:33:23.343Z"
  },
  "message": "Tournament started successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Not enough players
```json
{
  "success": false,
  "error": "Cannot start tournament. At least 2 players required."
}
```

- `400 Bad Request` - Already started
```json
{
  "success": false,
  "error": "Tournament is already started. Can only start tournaments in 'planning' status."
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/tournaments/{tournament-id}/start
```

---

### 6. Get Leaderboard
Get tournament status and leaderboard with calculated points.

**Endpoint:** `GET /tournaments/:id/leaderboard`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tournament_id": "uuid",
    "status": "planning|started|finished",
    "created_at": "2025-11-29T17:33:23.343Z",
    "leaderboard": [
      {
        "player_id": "uuid",
        "player_name": "Alice",
        "points": 3,
        "played": 2,
        "wins": 1,
        "draws": 1,
        "losses": 0
      }
    ]
  }
}
```

**Points System:**
- Win: 2 points
- Draw: 1 point
- Loss: 0 points

**Leaderboard is sorted by points (descending)**

**Example:**
```bash
curl http://localhost:3000/api/tournaments/{tournament-id}/leaderboard
```

---

### 7. Record Match Result
Record the result of a match.

**Endpoint:** `POST /matches/:matchId/result`

**Request Body:**
```json
{
  "scoreA": 3,
  "scoreB": 1
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tournament_id": "uuid",
    "player_a_id": "uuid",
    "player_b_id": "uuid",
    "score_a": 3,
    "score_b": 1,
    "status": "completed"
  },
  "message": "Match result recorded successfully"
}
```

**Notes:**
- Tournament will automatically transition to 'finished' status when all matches are completed
- Scores must be non-negative numbers

**Error Responses:**

- `400 Bad Request` - Invalid scores
```json
{
  "success": false,
  "error": "Scores must be non-negative numbers"
}
```

- `404 Not Found` - Match not found
```json
{
  "success": false,
  "error": "Match not found"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/matches/{match-id}/result \
  -H "Content-Type: application/json" \
  -d '{"scoreA":3,"scoreB":1}'
```

---

## Complete Workflow Example

```bash
# 1. Create a tournament
TOURNAMENT_ID=$(curl -s -X POST http://localhost:3000/api/tournaments | jq -r '.data.id')

# 2. Add players
curl -X POST http://localhost:3000/api/tournaments/$TOURNAMENT_ID/participants \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice"}'

curl -X POST http://localhost:3000/api/tournaments/$TOURNAMENT_ID/participants \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob"}'

curl -X POST http://localhost:3000/api/tournaments/$TOURNAMENT_ID/participants \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie"}'

# 3. Start tournament
curl -X PATCH http://localhost:3000/api/tournaments/$TOURNAMENT_ID/start

# 4. Get leaderboard
curl http://localhost:3000/api/tournaments/$TOURNAMENT_ID/leaderboard

# 5. Record match results (you'll need to get match IDs from the database)
curl -X POST http://localhost:3000/api/matches/{match-id}/result \
  -H "Content-Type: application/json" \
  -d '{"scoreA":2,"scoreB":1}'

# 6. Check final leaderboard
curl http://localhost:3000/api/tournaments/$TOURNAMENT_ID/leaderboard
```

---

## Business Rules

1. **Tournament Statuses:**
   - `planning`: Initial state, can add players (max 5)
   - `started`: Tournament in progress, matches being played
   - `finished`: All matches completed

2. **Player Management:**
   - Maximum 5 players per tournament
   - Players can only be added during 'planning' status
   - Players are created automatically if they don't exist
   - Same player cannot be added twice to a tournament

3. **Match Generation:**
   - Round-robin format: each player plays every other player once
   - Matches are generated when tournament starts
   - For N players: N*(N-1)/2 matches

4. **Scoring:**
   - Win: 2 points
   - Draw: 1 point
   - Loss: 0 points

5. **Tournament Completion:**
   - Tournament automatically finishes when all matches have results
   - Cannot add players or start tournament once it has started/finished

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200 OK` - Successful GET/PATCH request
- `201 Created` - Successful POST request
- `400 Bad Request` - Validation error or business rule violation
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

