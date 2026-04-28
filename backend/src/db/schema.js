import { pgTable, serial, text, real, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const evaluations = pgTable('evaluations', {
  id: serial('id').primaryKey(),
  evaluationName: text('evaluation_name'),
  model: text('model').notNull(),
  overallBiasScore: real('overall_bias_score').notNull(),
  totalPairsTested: integer('total_pairs_tested').notNull(),
  categoriesTested: jsonb('categories_tested').notNull(),
  categoryScores: jsonb('category_scores').notNull(),
  pairResults: jsonb('pair_results').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
