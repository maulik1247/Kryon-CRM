import { SignUp } from "@clerk/nextjs";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { clerkSignInAppearance } from "@/lib/clerk-appearance";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_12px_40px_rgba(17,42,51,0.08)]">
        <div className="border-b border-border/60 bg-gradient-to-br from-[#f0fbff] to-white px-6 py-5 sm:px-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Create account
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Or{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              sign in to demo
            </Link>
          </p>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/"
            appearance={clerkSignInAppearance}
          />
        </div>
      </div>
    </AuthPageShell>
  );
}
