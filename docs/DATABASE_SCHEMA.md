# HARDWOOD Database Schema

## Authentication Tables

### auth_users
- id (UUID, primary key) — maps to Supabase auth.users
- email (string, unique)
- username (string, unique, nullable)
- google_id (string, nullable) — external Google ID
- created_at (timestamp)
- updated_at (timestamp)

### jwt_tokens (optional: for token blacklisting/refresh)
- id (UUID, primary key)
- user_id (UUID, FK → auth_users)
- token_hash (string) — hashed JWT for quick lookup
- expires_at (timestamp)
- created_at (timestamp)

## Core Tables (from PRP)

### players
- id (UUID)
- name (string)
- team_id (UUID, FK → nba_teams)
- position (string: PG, SG, SF, PF, C)
- height (string)
- weight (int)
- nba_id (int) — external API reference
- created_at (timestamp)

### player_stats
- id (UUID)
- player_id (UUID, FK → players)
- season (int: 2024, 2023, etc.)
- ppg (float)
- rpg (float)
- apg (float)
- fg_pct (float)
- ts_pct (float)
- bpm (float)
- per (float)
- created_at (timestamp)

### nba_teams
- id (UUID)
- name (string)
- abbreviation (string: LAL, BOS, etc.)
- conference (string: Eastern, Western)

### user_teams
- id (UUID)
- user_id (UUID, FK → auth_users)
- name (string)
- created_at (timestamp)

### user_team_players
- team_id (UUID, FK → user_teams)
- player_id (UUID, FK → players)

### games
- id (UUID)
- home_team_id (UUID, FK → nba_teams)
- away_team_id (UUID, FK → nba_teams)
- score_home (int)
- score_away (int)
- game_date (timestamp)
- status (string: scheduled, live, finished)

### game_stats
- id (UUID)
- game_id (UUID, FK → games)
- player_id (UUID, FK → players)
- points (int)
- assists (int)
- rebounds (int)