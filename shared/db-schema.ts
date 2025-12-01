import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Users table - simple auth system
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique().notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"), // optional avatar URL
  gamesPlayed: integer("games_played").default(0),
  gamesWon: integer("games_won").default(0),
  totalPoints: integer("total_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at").defaultNow(),
});

// Game history table
export const gameHistory = pgTable("game_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  roomCode: text("room_code").notNull(),
  wasOddOneOut: boolean("was_odd_one_out").default(false),
  points: integer("points").default(0),
  won: boolean("won").default(false),
  roundNumber: integer("round_number").default(1),
  playedAt: timestamp("played_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  displayName: true,
  avatar: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type GameHistory = typeof gameHistory.$inferSelect;





