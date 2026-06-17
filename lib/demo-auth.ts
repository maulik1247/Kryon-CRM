/** Public demo credentials — intentional for client previews. */
export const DEMO_USER = {
  email: process.env.NEXT_PUBLIC_DEMO_USER_EMAIL ?? "demo@kryon.com",
  password: process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD ?? "KryonDemo1!",
  name: "Demo Client",
} as const;
