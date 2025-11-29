-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "username" text UNIQUE NOT NULL,
  "display_name" text NOT NULL,
  "avatar" text,
  "games_played" integer DEFAULT 0,
  "games_won" integer DEFAULT 0,
  "total_points" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "last_login_at" timestamp DEFAULT now()
);

-- Create game history table
CREATE TABLE IF NOT EXISTS "game_history" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text REFERENCES "users"("id"),
  "room_code" text NOT NULL,
  "was_odd_one_out" boolean DEFAULT false,
  "points" integer DEFAULT 0,
  "won" boolean DEFAULT false,
  "round_number" integer DEFAULT 1,
  "played_at" timestamp DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users"("username");
CREATE INDEX IF NOT EXISTS "idx_users_total_points" ON "users"("total_points" DESC);
CREATE INDEX IF NOT EXISTS "idx_game_history_user_id" ON "game_history"("user_id");
CREATE INDEX IF NOT EXISTS "idx_game_history_played_at" ON "game_history"("played_at" DESC);



