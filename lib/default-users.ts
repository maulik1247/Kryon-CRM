import type { CrmUser } from "./types";

export const DEFAULT_USERS: CrmUser[] = [
  {
    id: "user-admin",
    name: "Rajesh Kumar",
    email: "rajesh@kryon.com",
    role: "admin",
    active: true,
  },
  {
    id: "user-2",
    name: "Priya Sharma",
    email: "priya@kryon.com",
    role: "sales",
    active: true,
  },
  {
    id: "user-3",
    name: "Amit Patel",
    email: "amit@kryon.com",
    role: "sales",
    active: true,
  },
  {
    id: "user-4",
    name: "Sneha Reddy",
    email: "sneha@kryon.com",
    role: "sales",
    active: true,
  },
];

export const DEFAULT_CURRENT_USER_ID = "user-admin";
