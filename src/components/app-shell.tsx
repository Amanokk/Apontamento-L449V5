import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, ClipboardList, MapPinned, Plus, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Hoje", icon: CalendarDays },
  { to: "/novo", label: "Novo", icon: Plus },
  { to: "/mapa", label: "Mapa", icon: MapPinned },
  { to: "/historico", label: "Histórico", icon: ClipboardList },
  { to: "/cadastros", label: "Cadastros", icon: Settings2 },
] as const;

export function AppShell({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-bg">
      <div className={cn("flex min-h-0 flex-1 flex-col", hideNav ? "pb-0" : "pb-20")}>{children}</div>
      {hideNav ? null : (
        <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-sm">
          <div className="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)] pt-1">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-medium transition-colors duration-150",
                    active ? "text-primary" : "text-muted",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
