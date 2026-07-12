import { NextResponse } from "next/server";

import {
  deleteClientServer,
  getAdminStatsServer,
  listClientsServer,
  updateUserServer,
} from "@/lib/auth/server-store";
import { requireAdminSession } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const body = (await request.json()) as {
      credits?: number;
      blocked?: boolean;
      password?: string;
      addCredits?: number;
    };

    let patch: {
      credits?: number;
      blocked?: boolean;
      password?: string;
    } = {};

    if (typeof body.credits === "number") patch.credits = body.credits;
    if (typeof body.blocked === "boolean") patch.blocked = body.blocked;
    if (typeof body.password === "string") patch.password = body.password;

    if (typeof body.addCredits === "number") {
      const { findUserById } = await import("@/lib/auth/server-store");
      const current = await findUserById(id);
      if (!current) throw new Error("Client introuvable.");
      patch.credits = current.credits + body.addCredits;
    }

    await updateUserServer(id, patch);
    const [clients, stats] = await Promise.all([
      listClientsServer(),
      getAdminStatsServer(),
    ]);
    return NextResponse.json({ ok: true, clients, stats });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Mise à jour impossible.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    await deleteClientServer(id);
    const [clients, stats] = await Promise.all([
      listClientsServer(),
      getAdminStatsServer(),
    ]);
    return NextResponse.json({ ok: true, clients, stats });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Suppression impossible.",
      },
      { status: 400 },
    );
  }
}
