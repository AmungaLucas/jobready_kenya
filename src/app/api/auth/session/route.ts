import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
