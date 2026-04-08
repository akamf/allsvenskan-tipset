CREATE TABLE "participant_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"standings_snapshot_id" uuid NOT NULL,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "standings_snapshot_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "standings_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season" integer NOT NULL,
	"league_name" text NOT NULL,
	"source" text NOT NULL,
	"round_number" integer NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "top_scorer_snapshot_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"player_name" text NOT NULL,
	"team_name" text NOT NULL,
	"goals" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "top_scorer_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season" integer NOT NULL,
	"league_name" text NOT NULL,
	"source" text NOT NULL,
	"round_number" integer NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "participant_scores" ADD CONSTRAINT "participant_scores_standings_snapshot_id_standings_snapshots_id_fk" FOREIGN KEY ("standings_snapshot_id") REFERENCES "public"."standings_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standings_snapshot_rows" ADD CONSTRAINT "standings_snapshot_rows_snapshot_id_standings_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."standings_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "top_scorer_snapshot_rows" ADD CONSTRAINT "top_scorer_snapshot_rows_snapshot_id_top_scorer_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."top_scorer_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "participant_scores_snapshot_participant_unique" ON "participant_scores" USING btree ("standings_snapshot_id","participant_id");--> statement-breakpoint
CREATE INDEX "participant_scores_snapshot_ranking_idx" ON "participant_scores" USING btree ("standings_snapshot_id","ranking");--> statement-breakpoint
CREATE UNIQUE INDEX "standings_snapshot_rows_snapshot_team_unique" ON "standings_snapshot_rows" USING btree ("snapshot_id","team_name");--> statement-breakpoint
CREATE UNIQUE INDEX "standings_snapshots_season_round_unique" ON "standings_snapshots" USING btree ("season","round_number");--> statement-breakpoint
CREATE INDEX "standings_snapshots_season_round_idx" ON "standings_snapshots" USING btree ("season","round_number");--> statement-breakpoint
CREATE UNIQUE INDEX "top_scorer_snapshot_rows_snapshot_rank_unique" ON "top_scorer_snapshot_rows" USING btree ("snapshot_id","rank");--> statement-breakpoint
CREATE UNIQUE INDEX "top_scorer_snapshots_season_round_unique" ON "top_scorer_snapshots" USING btree ("season","round_number");--> statement-breakpoint
CREATE INDEX "top_scorer_snapshots_season_round_idx" ON "top_scorer_snapshots" USING btree ("season","round_number");