CREATE TABLE IF NOT EXISTS "standings_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "season" integer NOT NULL,
  "league_name" text NOT NULL,
  "source" text NOT NULL,
  "round_number" integer NOT NULL,
  "captured_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "standings_snapshots_season_round_unique"
  ON "standings_snapshots" ("season", "round_number");
CREATE INDEX IF NOT EXISTS "standings_snapshots_season_round_idx"
  ON "standings_snapshots" ("season", "round_number");

CREATE TABLE IF NOT EXISTS "standings_snapshot_rows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "snapshot_id" uuid NOT NULL REFERENCES "standings_snapshots"("id") ON DELETE CASCADE,
  "team_name" text NOT NULL,
  "position" integer NOT NULL,
  "played" integer NOT NULL,
  "won" integer NOT NULL,
  "drawn" integer NOT NULL,
  "lost" integer NOT NULL,
  "goals_for" integer NOT NULL,
  "goals_against" integer NOT NULL,
  "goal_difference" integer NOT NULL,
  "points" integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "standings_snapshot_rows_snapshot_team_unique"
  ON "standings_snapshot_rows" ("snapshot_id", "team_name");

CREATE TABLE IF NOT EXISTS "top_scorer_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "season" integer NOT NULL,
  "league_name" text NOT NULL,
  "source" text NOT NULL,
  "round_number" integer NOT NULL,
  "captured_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "top_scorer_snapshots_season_round_unique"
  ON "top_scorer_snapshots" ("season", "round_number");
CREATE INDEX IF NOT EXISTS "top_scorer_snapshots_season_round_idx"
  ON "top_scorer_snapshots" ("season", "round_number");

CREATE TABLE IF NOT EXISTS "top_scorer_snapshot_rows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "snapshot_id" uuid NOT NULL REFERENCES "top_scorer_snapshots"("id") ON DELETE CASCADE,
  "rank" integer NOT NULL,
  "player_name" text NOT NULL,
  "team_name" text NOT NULL,
  "goals" integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "top_scorer_snapshot_rows_snapshot_rank_unique"
  ON "top_scorer_snapshot_rows" ("snapshot_id", "rank");

CREATE TABLE IF NOT EXISTS "participant_scores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "standings_snapshot_id" uuid NOT NULL REFERENCES "standings_snapshots"("id") ON DELETE CASCADE,
  "participant_id" text NOT NULL,
  "participant_name" text NOT NULL,
  "total_points" integer NOT NULL,
  "ranking" integer NOT NULL,
  "beer_debt" integer NOT NULL,
  "exact_hits" integer NOT NULL,
  "near_hits" integer NOT NULL,
  "penalty_points" integer NOT NULL,
  "champion_bonus" integer NOT NULL,
  "relegation_bonus" integer NOT NULL,
  "tiebreak_score" integer NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "participant_scores_snapshot_participant_unique"
  ON "participant_scores" ("standings_snapshot_id", "participant_id");
CREATE INDEX IF NOT EXISTS "participant_scores_snapshot_ranking_idx"
  ON "participant_scores" ("standings_snapshot_id", "ranking");
