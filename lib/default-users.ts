import type { CrmUser } from "./types";

export const DEFAULT_USERS: CrmUser[] = [
  {
    id: "user-demo",
    name: "Demo Client",
    email: "demo@kryon.com",
    role: "admin",
    active: true,
  },
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
    role: "sales_rep",
    active: true,
    reportsToUserId: "user-3",
  },
  {
    id: "user-3",
    name: "Amit Patel",
    email: "amit@kryon.com",
    role: "sales_manager",
    active: true,
  },
  {
    id: "user-4",
    name: "Sneha Reddy",
    email: "sneha@kryon.com",
    role: "commercial_manager",
    active: true,
  },
  {
    id: "user-5",
    name: "Vikram Singh",
    email: "vikram@kryon.com",
    role: "vp_director",
    active: true,
  },
  {
    id: "user-6",
    name: "Ananya Iyer",
    email: "ananya@kryon.com",
    role: "rnd",
    active: true,
  },
  {
    id: "user-7",
    name: "Karan Mehta",
    email: "karan@kryon.com",
    role: "quality",
    active: true,
  },
  {
    id: "user-8",
    name: "Deepa Nair",
    email: "deepa@kryon.com",
    role: "finance",
    active: true,
  },
];

export const DEFAULT_CURRENT_USER_ID = "user-admin";
