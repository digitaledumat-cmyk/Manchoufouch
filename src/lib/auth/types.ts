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
  /** Slug public unique (renseigné à la validation admin). */
  publicSlug?: string;
  /** Chemin public ex. /annonces/mon-titre */
  publicPath?: string;
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
