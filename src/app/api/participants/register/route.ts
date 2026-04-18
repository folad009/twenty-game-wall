import { NextResponse } from "next/server";

import { registerParticipant } from "@/lib/participants-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const participant = await registerParticipant(body.name ?? "");
    return NextResponse.json({ participant });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not complete registration.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
