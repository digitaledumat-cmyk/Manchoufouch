/**
 * Types + constantes auth (compat).
 * La source de vérité des comptes / articles est le store serveur
 * (`server-store` + API `/api/auth/*` et `/api/admin/*`).
 */
export {
  DEFAULT_ADMIN,
  type AdminDashboardStats,
  type AuthSession,
  type AuthUser,
  type ClientArticle,
  type ClientArticleStatus,
  type ClientPublicUser,
  type StoredUser,
  type UserRole,
} from "@/lib/auth/types";
