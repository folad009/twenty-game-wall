import { NextResponse } from "next/server";

import { listParticipants } from "@/lib/participants-store";

export async function GET() {
  const participants = await listParticipants();
  return NextResponse.json({ participants });
}
