import { desc, eq } from "drizzle-orm";

import { participants } from "@/db/schema";
import { getDb } from "@/db";
import type { Participant } from "@/lib/quiz";

function rowToParticipant(row: typeof participants.$inferSelect): Participant {
  return {
    id: row.id,
    name: row.name,
    answer: row.answer,
    registeredAt: row.registeredAt.toISOString(),
    answeredAt: row.answeredAt ? row.answeredAt.toISOString() : null,
  };
}

export async function registerParticipant(name: string): Promise<Participant> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Name is required.");
  }

  const db = getDb();
  const [row] = await db
    .insert(participants)
    .values({
      name: trimmedName,
    })
    .returning();

  if (!row) {
    throw new Error("Could not create participant.");
  }

  return rowToParticipant(row);
}

export async function submitAnswer(
  id: string,
  answer: string
): Promise<Participant> {
  const trimmed = answer.trim();
  if (!trimmed) {
    throw new Error("Answer cannot be empty.");
  }

  const db = getDb();
  const [row] = await db
    .update(participants)
    .set({
      answer: trimmed,
      answeredAt: new Date(),
    })
    .where(eq(participants.id, id))
    .returning();

  if (!row) {
    throw new Error("Participant not found.");
  }

  return rowToParticipant(row);
}

export async function listParticipants(): Promise<Participant[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(participants)
    .orderBy(desc(participants.registeredAt));

  return rows.map(rowToParticipant);
}
