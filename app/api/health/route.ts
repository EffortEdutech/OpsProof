import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "firemaint",
    version: "phase-0"
  });
}
