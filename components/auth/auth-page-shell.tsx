import { Zap } from "lucide-react";

interface AuthPageShellProps {
  children: React.ReactNode;
}

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden min-h-screen w-[min(440px,40vw)] shrink-0 flex-col justify-between overflow-hidden bg-[#051218] p-10 xl:p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at -10% -10%, rgba(0,180,230,0.45) 0%, transparent 50%), radial-gradient(ellipse 70% 60% at 110% 110%, rgba(6,95,115,0.4) 0%, transparent 45%)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Zap className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <span className="font-display text-base font-semibold tracking-[0.22em] text-white">
            KRYON
          </span>
        </div>

        <div className="relative max-w-xs space-y-4 xl:max-w-sm">
          <h1 className="font-display text-3xl font-semibold leading-[1.12] tracking-tight text-white xl:text-[2.35rem]">
            BLDC sales CRM, built for your team.
          </h1>
          <p className="text-sm leading-relaxed text-white/60">
            Pipeline, tasks, customers, and field activity — one workspace for
            Kryon motor controller sales.
          </p>
        </div>

        <p className="relative text-[11px] text-white/30">
          © {new Date().getFullYear()} Kryon CRM
        </p>
      </div>

      <div className="flex min-h-screen flex-1 items-center justify-center bg-[linear-gradient(180deg,#f4f9fb_0%,#eef4f7_100%)] px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
