import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";

import {
  DEFAULT_ADMIN,
  type AdminDashboardStats,
  type ClientArticle,
  type ClientPublicUser,
  type StoredUser,
} from "@/lib/auth/types";

type DbShape = {
  users: StoredUser[];
  articles: ClientArticle[];
};

const BLOB_PATH = "manchoufouch/auth-store.json";
const STABLE_ADMIN_ID = "admin-manchoufouch";

declare global {
  // eslint-disable-next-line no-var
  var __manchoufouchAuthDb: DbShape | undefined;
}

function dataPaths() {
  const cwdPath = path.join(process.cwd(), "data", "auth-store.json");
  const tmpPath = path.join("/tmp", "manchoufouch-auth-store.json");
  return { cwdPath, tmpPath };
}

function hasBlobStore() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim(),
  );
}

function normalizeUser(user: StoredUser): StoredUser {
  return {
    ...user,
    role: user.role ?? (user.email === DEFAULT_ADMIN.email ? "admin" : "client"),
    blocked: user.blocked ?? false,
    loginCount: user.loginCount ?? 0,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}

function toPublicUser(user: StoredUser): ClientPublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}

function seedAdmin(users: StoredUser[]): StoredUser[] {
  const normalized = users.map(normalizeUser);
  const existing = normalized.find((user) => user.email === DEFAULT_ADMIN.email);
  if (existing) {
    return normalized.map((user) =>
      user.email === DEFAULT_ADMIN.email
        ? { ...user, id: STABLE_ADMIN_ID, role: "admin" as const }
        : user,
    );
  }

  const admin: StoredUser = {
    id: STABLE_ADMIN_ID,
    name: DEFAULT_ADMIN.name,
    email: DEFAULT_ADMIN.email,
    password: DEFAULT_ADMIN.password,
    credits: 999,
    role: "admin",
    blocked: false,
    loginCount: 0,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
  };
  return [...normalized, admin];
}

function mergeDb(base: DbShape, local: DbShape): DbShape {
  const users = new Map<string, StoredUser>();
  for (const user of base.users) {
    users.set(user.email.toLowerCase(), normalizeUser(user));
  }
  // Local mutations win for the same email (credits, block, password, login…).
  for (const user of local.users) {
    users.set(user.email.toLowerCase(), normalizeUser(user));
  }

  const articles = new Map<string, ClientArticle>();
  for (const article of base.articles) {
    articles.set(article.id, article);
  }
  for (const article of local.articles) {
    articles.set(article.id, article);
  }

  return {
    users: seedAdmin([...users.values()]),
    articles: [...articles.values()],
  };
}

async function streamToText(stream: ReadableStream<Uint8Array> | null) {
  if (!stream) return "";
  return new Response(stream).text();
}

async function readFromBlob(): Promise<{ db: DbShape; etag?: string } | null> {
  if (!hasBlobStore()) return null;
  try {
    const result = await get(BLOB_PATH, {
      access: "private",
      useCache: false,
    });
    if (!result?.stream) return null;
    const raw = await streamToText(result.stream);
    if (!raw.trim()) return null;
    const parsed = JSON.parse(raw) as DbShape;
    return {
      db: {
        users: Array.isArray(parsed.users) ? parsed.users.map(normalizeUser) : [],
        articles: Array.isArray(parsed.articles) ? parsed.articles : [],
      },
      etag: result.blob?.etag,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "BlobNotFoundError" ||
        error.message.toLowerCase().includes("not found"))
    ) {
      return null;
    }
    throw error;
  }
}

async function putBlob(db: DbShape) {
  const result = await put(BLOB_PATH, JSON.stringify(db, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return result;
}

async function readFromDisk(): Promise<DbShape | null> {
  const { cwdPath, tmpPath } = dataPaths();
  for (const filePath of [cwdPath, tmpPath]) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as DbShape;
      return {
        users: Array.isArray(parsed.users) ? parsed.users.map(normalizeUser) : [],
        articles: Array.isArray(parsed.articles) ? parsed.articles : [],
      };
    } catch {
      // try next path
    }
  }
  return null;
}

async function writeToDisk(db: DbShape) {
  const payload = JSON.stringify(db, null, 2);
  const { cwdPath, tmpPath } = dataPaths();
  await fs.mkdir(path.dirname(cwdPath), { recursive: true }).catch(() => undefined);
  await fs.mkdir(path.dirname(tmpPath), { recursive: true }).catch(() => undefined);

  let wrote = false;
  for (const filePath of [cwdPath, tmpPath]) {
    try {
      await fs.writeFile(filePath, payload, "utf8");
      wrote = true;
    } catch {
      // try next path
    }
  }
  return wrote;
}

async function loadDbFresh(): Promise<DbShape> {
  if (hasBlobStore()) {
    const fromBlob = await readFromBlob();
    if (fromBlob) {
      const db = {
        users: seedAdmin(fromBlob.db.users),
        articles: fromBlob.db.articles,
      };
      global.__manchoufouchAuthDb = db;
      return db;
    }

    const empty: DbShape = { users: seedAdmin([]), articles: [] };
    await putBlob(empty);
    global.__manchoufouchAuthDb = empty;
    await writeToDisk(empty).catch(() => undefined);
    return empty;
  }

  const fromDisk = await readFromDisk();
  const db: DbShape = fromDisk
    ? {
        users: seedAdmin(fromDisk.users),
        articles: fromDisk.articles,
      }
    : { users: seedAdmin([]), articles: [] };

  global.__manchoufouchAuthDb = db;
  await writeToDisk(db).catch(() => undefined);
  return db;
}

async function loadDb(): Promise<DbShape> {
  // Always reload from Blob when configured so all instances share one source.
  if (hasBlobStore()) {
    return loadDbFresh();
  }
  if (global.__manchoufouchAuthDb) {
    global.__manchoufouchAuthDb.users = seedAdmin(
      global.__manchoufouchAuthDb.users,
    );
    return global.__manchoufouchAuthDb;
  }
  return loadDbFresh();
}

async function saveDb(local: DbShape) {
  if (hasBlobStore()) {
    // Re-read + merge so concurrent register/login don't wipe each other.
    let merged = local;
    try {
      const latest = await readFromBlob();
      if (latest) {
        merged = mergeDb(latest.db, local);
      }
    } catch {
      merged = local;
    }

    try {
      await putBlob(merged);
    } catch (error) {
      // Rare conflict: merge once more and overwrite.
      if (error instanceof BlobPreconditionFailedError) {
        const latest = await readFromBlob();
        merged = latest ? mergeDb(latest.db, local) : local;
        await putBlob(merged);
      } else {
        throw error;
      }
    }

    global.__manchoufouchAuthDb = merged;
    await writeToDisk(merged).catch(() => undefined);
    return;
  }

  global.__manchoufouchAuthDb = local;
  const diskOk = await writeToDisk(local).catch(() => false);
  if (!diskOk) {
    throw new Error("Impossible d'enregistrer les comptes sur le serveur.");
  }
}

export async function resolveUserFromSession(input: {
  id?: string;
  email?: string;
}): Promise<StoredUser | null> {
  const db = await loadDb();
  if (input.id) {
    const byId = db.users.find((user) => user.id === input.id);
    if (byId) return byId;
  }
  if (input.email) {
    const email = input.email.trim().toLowerCase();
    return db.users.find((user) => user.email === email) ?? null;
  }
  return null;
}

export async function listClientsServer(): Promise<ClientPublicUser[]> {
  const db = await loadDb();
  return db.users
    .filter((user) => user.role !== "admin")
    .map(toPublicUser)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getAdminStatsServer(): Promise<AdminDashboardStats> {
  const db = await loadDb();
  const clients = db.users.filter((user) => user.role !== "admin");
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  return {
    totalClients: clients.length,
    newUsers: clients.filter(
      (client) => new Date(client.createdAt).getTime() >= weekAgo,
    ).length,
    activeUsers: clients.filter(
      (client) =>
        !client.blocked &&
        !!client.lastLoginAt &&
        new Date(client.lastLoginAt).getTime() >= monthAgo,
    ).length,
    withCredits: clients.filter((client) => client.credits > 0).length,
    withoutCredits: clients.filter((client) => client.credits <= 0).length,
    blockedUsers: clients.filter((client) => client.blocked).length,
    totalLogins: clients.reduce((sum, client) => sum + client.loginCount, 0),
    pendingArticles: db.articles.filter((article) => article.status === "pending")
      .length,
  };
}

export async function findUserByEmail(email: string) {
  const db = await loadDb();
  return (
    db.users.find((user) => user.email === email.trim().toLowerCase()) ?? null
  );
}

export async function findUserById(id: string) {
  const db = await loadDb();
  return db.users.find((user) => user.id === id) ?? null;
}

export async function registerUserServer(input: {
  name: string;
  email: string;
  password: string;
  credits?: number;
  createdByAdmin?: boolean;
}): Promise<StoredUser> {
  const db = await loadDb();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!name || !email) {
    throw new Error("Nom et e-mail obligatoires.");
  }
  if (input.password.length < 6) {
    throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
  }
  if (db.users.some((user) => user.email === email)) {
    throw new Error("Un compte existe déjà avec cet e-mail.");
  }

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: randomUUID(),
    name,
    email,
    password: input.password,
    credits: Math.max(0, Math.floor(input.credits ?? 0)),
    role: "client",
    blocked: false,
    loginCount: input.createdByAdmin ? 0 : 1,
    lastLoginAt: input.createdByAdmin ? null : now,
    createdAt: now,
  };

  db.users = [...db.users, user];
  await saveDb(db);
  return user;
}

export async function loginUserServer(input: {
  email: string;
  password: string;
}): Promise<StoredUser> {
  const db = await loadDb();
  const email = input.email.trim().toLowerCase();
  const user = db.users.find((item) => item.email === email);

  if (!user || user.password !== input.password) {
    throw new Error("E-mail ou mot de passe incorrect.");
  }
  if (user.blocked) {
    throw new Error("Ce compte est bloqué. Contactez l'administrateur.");
  }

  const now = new Date().toISOString();
  db.users = db.users.map((item) =>
    item.id === user.id
      ? {
          ...item,
          loginCount: (item.loginCount ?? 0) + 1,
          lastLoginAt: now,
        }
      : item,
  );
  await saveDb(db);
  return db.users.find((item) => item.id === user.id)!;
}

export async function updateUserServer(
  userId: string,
  patch: Partial<
    Pick<StoredUser, "credits" | "blocked" | "password" | "name">
  >,
): Promise<StoredUser> {
  const db = await loadDb();
  const target = db.users.find((user) => user.id === userId);
  if (!target) throw new Error("Client introuvable.");
  if (target.role === "admin" && (patch.blocked || patch.password)) {
    throw new Error("Action non autorisée sur le compte admin.");
  }
  if (patch.password && patch.password.length < 6) {
    throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
  }

  db.users = db.users.map((user) =>
    user.id === userId
      ? {
          ...user,
          ...patch,
          credits:
            patch.credits != null
              ? Math.max(0, Math.floor(patch.credits))
              : user.credits,
        }
      : user,
  );
  await saveDb(db);
  return db.users.find((user) => user.id === userId)!;
}

export async function addCreditsServer(userId: string, articles: number) {
  const user = await findUserById(userId);
  if (!user) throw new Error("Utilisateur introuvable.");
  return updateUserServer(userId, { credits: user.credits + articles });
}

export async function consumeCreditServer(userId: string) {
  const user = await findUserById(userId);
  if (!user) throw new Error("Vous devez être connecté.");
  if (user.credits < 1) {
    throw new Error("Crédits insuffisants. Achetez un pack pour publier.");
  }
  return updateUserServer(userId, { credits: user.credits - 1 });
}

export async function deleteClientServer(userId: string) {
  const db = await loadDb();
  const target = db.users.find((user) => user.id === userId);
  if (!target) throw new Error("Client introuvable.");
  if (target.role === "admin") {
    throw new Error("Impossible de supprimer un admin.");
  }
  db.users = db.users.filter((user) => user.id !== userId);
  db.articles = db.articles.filter((article) => article.userId !== userId);
  await saveDb(db);
}

export async function listArticlesServer(): Promise<ClientArticle[]> {
  const db = await loadDb();
  return [...db.articles].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createArticleServer(
  input: Omit<
    ClientArticle,
    "id" | "status" | "adminNote" | "createdAt" | "updatedAt"
  >,
): Promise<ClientArticle> {
  const db = await loadDb();
  const now = new Date().toISOString();
  const article: ClientArticle = {
    ...input,
    id: randomUUID(),
    status: "pending",
    adminNote: "",
    createdAt: now,
    updatedAt: now,
  };
  db.articles = [article, ...db.articles];
  await saveDb(db);
  return article;
}

export async function updateArticleServer(
  id: string,
  patch: Partial<
    Pick<
      ClientArticle,
      | "title"
      | "domain"
      | "targetUrl"
      | "backlinks"
      | "metaDescription"
      | "keywords"
      | "h1"
      | "content"
      | "status"
      | "adminNote"
    >
  >,
): Promise<ClientArticle> {
  const db = await loadDb();
  const index = db.articles.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Article introuvable.");

  const updated: ClientArticle = {
    ...db.articles[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  db.articles[index] = updated;
  await saveDb(db);
  return updated;
}

export async function deleteArticleServer(id: string) {
  const db = await loadDb();
  db.articles = db.articles.filter((item) => item.id !== id);
  await saveDb(db);
}

export function publicSessionFromUser(
  user: StoredUser,
  purchasedPacks: AuthSessionPacks = [],
) {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
    },
    credits: user.credits,
    purchasedPacks,
  };
}

type AuthSessionPacks = {
  packId: string;
  articles: number;
  at: string;
}[];
