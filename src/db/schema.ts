import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  answer: text("answer"),
  registeredAt: timestamp("registered_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  answeredAt: timestamp("answered_at", { withTimezone: true }),
});
