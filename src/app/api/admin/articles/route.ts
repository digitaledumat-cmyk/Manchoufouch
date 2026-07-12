import { NextResponse } from "next/server";

import {
  getAdminStatsServer,
  listArticlesServer,
} from "@/lib/auth/server-store";
import { requireAdminSession } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireAdminSession();
    const [articles, stats] = await Promise.all([
      listArticlesServer(),
      getAdminStatsServer(),
    ]);
    return NextResponse.json({ articles, stats });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Accès admin requis.",
      },
      { status: 401 },
    );
  }
}
