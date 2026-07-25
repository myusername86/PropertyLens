import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Dev-only role simulation. In production this comes from the JWT's role
 * claim (Entra ID); locally, this store lets the UI and API calls behave
 * as if signed in as a chosen role, so RBAC is demonstrable without a
 * full identity provider.
 */
export const AppRole = {
  Analyst: 'Analyst',
  Investor: 'Investor',
  Admin: 'Admin',
} as const;
export type AppRole = (typeof AppRole)[keyof typeof AppRole];

const roleRank: Record<AppRole, number> = {
  [AppRole.Analyst]: 0,
  [AppRole.Investor]: 1,
  [AppRole.Admin]: 2,
};

interface RoleState {
  role: AppRole;
  setRole: (role: AppRole) => void;
  /** True if the current role is at least as privileged as `minimum`. */
  hasAtLeast: (minimum: AppRole) => boolean;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      role: AppRole.Admin,
      setRole: (role) => set({ role }),
      hasAtLeast: (minimum) => roleRank[get().role] >= roleRank[minimum],
    }),
    { name: 'propertylens-dev-role' },
  ),
);
