import { NextResponse } from "next/server";

import {
  getAdminStatsServer,
  listClientsServer,
  publicSessionFromUser,
  registerUserServer,
} from "@/lib/auth/server-store";
import { requireAdminSession } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireAdminSession();
    const [clients, stats] = await Promise.all([
      listClientsServer(),
      getAdminStatsServer(),
    ]);
    return NextResponse.json({ clients, stats });
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

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      credits?: number;
    };

    const user = await registerUserServer({
      name: body.name || "",
      email: body.email || "",
      password: body.password || "",
      credits: body.credits,
      createdByAdmin: true,
    });

    const [clients, stats] = await Promise.all([
      listClientsServer(),
      getAdminStatsServer(),
    ]);

    return NextResponse.json({
      ok: true,
      client: publicSessionFromUser(user).user,
      clients,
      stats,
      message: `Compte créé : ${user.email}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Création du compte impossible.",
      },
      { status: 400 },
    );
  }
}
