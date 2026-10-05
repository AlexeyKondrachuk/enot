import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getVapidPublicKey } from "@/lib/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ publicKey: getVapidPublicKey() });
  } catch {
    return NextResponse.json({ error: "Push notifications are not configured" }, { status: 503 });
  }
}
