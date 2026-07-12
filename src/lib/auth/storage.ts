export type UserRole = "admin" | "client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: UserRole;
};

export type AuthSession = {
  user: AuthUser;
  credits: number;
  purchasedPacks: { packId: string; articles: number; at: string }[];
};

export const AUTH_STORAGE_KEY = "manchoufouch.auth.v1";
export const USERS_STORAGE_KEY = "manchoufouch.users.v1";
export const ARTICLES_STORAGE_KEY = "manchoufouch.articles.v1";

export const DEFAULT_ADMIN = {
  email: "admin@manchoufouch.ma",
  password: "admin123",
  name: "Admin Manchoufouch",
} as const;

export type StoredUser = AuthUser & {
  password: string;
  credits: number;
  blocked: boolean;
  loginCount: number;
  lastLoginAt: string | null;
};

export type ClientPublicUser = Omit<StoredUser, "password">;

export type ClientArticleStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_correction";

export type ClientArticle = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  domain: string;
  targetUrl: string;
  backlinks: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  content: string;
  status: ClientArticleStatus;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminDashboardStats = {
  totalClients: number;
  newUsers: number;
  activeUsers: number;
  withCredits: number;
  withoutCredits: number;
  blockedUsers: number;
  totalLogins: number;
  pendingArticles: number;
};

function normalizeUser(user: Partial<StoredUser> & AuthUser & { password: string; credits: number }): StoredUser {
  return {
    ...user,
    role: user.role ?? (user.email === DEFAULT_ADMIN.email ? "admin" : "client"),
    blocked: user.blocked ?? false,
    loginCount: user.loginCount ?? 0,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (!session.user.role) {
      session.user.role =
        session.user.email === DEFAULT_ADMIN.email ? "admin" : "client";
    }
    return session;
  } catch {
    return null;
  }
}

export function writeSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const users = raw ? (JSON.parse(raw) as StoredUser[]) : [];
    return users.map((user) => normalizeUser(user));
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function toPublicUser(user: StoredUser): ClientPublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}

/** Crée le compte admin par défaut si absent. */
export function ensureAdminSeed() {
  if (typeof window === "undefined") return;
  const users = readUsers();
  if (users.some((user) => user.email === DEFAULT_ADMIN.email)) return;

  const admin: StoredUser = {
    id: crypto.randomUUID(),
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
  writeUsers([...users, admin]);
}

export function listClients(): ClientPublicUser[] {
  ensureAdminSeed();
  return readUsers()
    .filter((user) => user.role !== "admin")
    .map(toPublicUser);
}

export function listAllUsers(): ClientPublicUser[] {
  ensureAdminSeed();
  return readUsers().map(toPublicUser);
}

export function getAdminDashboardStats(): AdminDashboardStats {
  const clients = listClients();
  const articles = readClientArticles();
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
    pendingArticles: articles.filter((article) => article.status === "pending")
      .length,
  };
}

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): AuthSession {
  ensureAdminSeed();
  const email = input.email.trim().toLowerCase();
  const users = readUsers();

  if (users.some((user) => user.email === email)) {
    throw new Error("Un compte existe déjà avec cet e-mail.");
  }

  if (input.password.length < 6) {
    throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
  }

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    password: input.password,
    credits: 0,
    role: "client",
    blocked: false,
    loginCount: 1,
    lastLoginAt: now,
    createdAt: now,
  };

  writeUsers([...users, user]);

  const session: AuthSession = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      role: "client",
    },
    credits: 0,
    purchasedPacks: [],
  };
  writeSession(session);
  return session;
}

export function loginUser(input: {
  email: string;
  password: string;
}): AuthSession {
  ensureAdminSeed();
  const email = input.email.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((item) => item.email === email);

  if (!user || user.password !== input.password) {
    throw new Error("E-mail ou mot de passe incorrect.");
  }

  if (user.blocked) {
    throw new Error("Ce compte est bloqué. Contactez l'administrateur.");
  }

  const now = new Date().toISOString();
  const updatedUsers = users.map((item) =>
    item.id === user.id
      ? {
          ...item,
          loginCount: (item.loginCount ?? 0) + 1,
          lastLoginAt: now,
        }
      : item,
  );
  writeUsers(updatedUsers);

  const refreshed = updatedUsers.find((item) => item.id === user.id)!;
  const existing = readSession();
  const session: AuthSession = {
    user: {
      id: refreshed.id,
      name: refreshed.name,
      email: refreshed.email,
      createdAt: refreshed.createdAt,
      role: refreshed.role ?? "client",
    },
    credits: refreshed.credits,
    purchasedPacks: existing?.user.id === refreshed.id ? existing.purchasedPacks : [],
  };
  writeSession(session);
  return session;
}

export function resetClientPassword(userId: string, newPassword: string) {
  if (newPassword.length < 6) {
    throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
  }

  const users = readUsers();
  const target = users.find((user) => user.id === userId);
  if (!target) throw new Error("Client introuvable.");
  if (target.role === "admin") {
    throw new Error("Impossible de réinitialiser le mot de passe admin ici.");
  }

  writeUsers(
    users.map((user) =>
      user.id === userId ? { ...user, password: newPassword } : user,
    ),
  );

  return newPassword;
}

export function setClientBlocked(userId: string, blocked: boolean) {
  const users = readUsers();
  const target = users.find((user) => user.id === userId);
  if (!target) throw new Error("Client introuvable.");
  if (target.role === "admin") throw new Error("Impossible de bloquer un admin.");

  writeUsers(
    users.map((user) => (user.id === userId ? { ...user, blocked } : user)),
  );

  if (blocked) {
    const session = readSession();
    if (session?.user.id === userId) {
      writeSession(null);
    }
  }
}

export function addCreditsToUser(userId: string, articles: number) {
  const users = readUsers();
  const next = users.map((user) =>
    user.id === userId ? { ...user, credits: user.credits + articles } : user,
  );
  writeUsers(next);

  const session = readSession();
  if (session && session.user.id === userId) {
    const updated: AuthSession = {
      ...session,
      credits: session.credits + articles,
    };
    writeSession(updated);
    return updated;
  }
  return session;
}

export function setCreditsForUser(userId: string, credits: number) {
  const safe = Math.max(0, Math.floor(credits));
  const users = readUsers();
  writeUsers(
    users.map((user) =>
      user.id === userId ? { ...user, credits: safe } : user,
    ),
  );

  const session = readSession();
  if (session && session.user.id === userId) {
    const updated: AuthSession = { ...session, credits: safe };
    writeSession(updated);
    return updated;
  }
  return null;
}

export function deleteClientUser(userId: string) {
  const users = readUsers();
  const target = users.find((user) => user.id === userId);
  if (!target) throw new Error("Client introuvable.");
  if (target.role === "admin") throw new Error("Impossible de supprimer un admin.");

  writeUsers(users.filter((user) => user.id !== userId));

  const articles = readClientArticles().filter(
    (article) => article.userId !== userId,
  );
  writeClientArticles(articles);

  const session = readSession();
  if (session?.user.id === userId) {
    writeSession(null);
  }
}

export function consumeCredit(userId: string): AuthSession {
  const session = readSession();
  if (!session || session.user.id !== userId) {
    throw new Error("Vous devez être connecté.");
  }
  if (session.credits < 1) {
    throw new Error("Crédits insuffisants. Achetez un pack pour publier.");
  }

  const users = readUsers();
  writeUsers(
    users.map((user) =>
      user.id === userId
        ? { ...user, credits: Math.max(0, user.credits - 1) }
        : user,
    ),
  );

  const updated: AuthSession = {
    ...session,
    credits: session.credits - 1,
  };
  writeSession(updated);
  return updated;
}

export function readClientArticles(): ClientArticle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARTICLES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClientArticle[]) : [];
  } catch {
    return [];
  }
}

function writeClientArticles(articles: ClientArticle[]) {
  localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
}

export function createClientArticle(
  input: Omit<
    ClientArticle,
    "id" | "status" | "adminNote" | "createdAt" | "updatedAt"
  >,
): ClientArticle {
  const article: ClientArticle = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    adminNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeClientArticles([article, ...readClientArticles()]);
  return article;
}

export function updateClientArticle(
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
): ClientArticle {
  const articles = readClientArticles();
  const index = articles.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Article introuvable.");

  const updated: ClientArticle = {
    ...articles[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  articles[index] = updated;
  writeClientArticles(articles);
  return updated;
}

export function deleteClientArticle(id: string) {
  writeClientArticles(readClientArticles().filter((item) => item.id !== id));
}
