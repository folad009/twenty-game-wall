import { NextResponse } from "next/server";

import { submitAnswer } from "@/lib/participants-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; answer?: string };
    if (!body.id) {
      return NextResponse.json({ error: "Missing participant id." }, { status: 400 });
    }
    const participant = await submitAnswer(body.id, body.answer ?? "");
    return NextResponse.json({ participant });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save answer.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
