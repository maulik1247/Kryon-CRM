"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import {
  Building2,
  Factory,
  Kanban,
  ListTodo,
  Package,
  ScrollText,
  Search,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import {
  getSearchTypeLabel,
  runGlobalSearch,
  type SearchResult,
  type SearchResultType,
} from "@/lib/global-search";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<
  SearchResultType,
  React.ComponentType<{ className?: string }>
> = {
  customer: Building2,
  contact: Users,
  deal: Kanban,
  task: ListTodo,
  activity: ScrollText,
  product: Package,
  supplier: Factory,
};

function HighlightMatch({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-primary/20 px-0.5 font-medium text-foreground">
        {text.slice(index, index + trimmed.length)}
      </mark>
      {text.slice(index + trimmed.length)}
    </>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const { currentUser, users } = useAuth();
  const {
    customers,
    contacts,
    deals,
    products,
    suppliers,
    dealTasks,
    dealActivities,
    pipelineStages,
    getCustomerById,
  } = useCrmData();

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const groups = React.useMemo(() => {
    if (!open || query.trim().length < 2) {
      return [];
    }

    return runGlobalSearch({
      query,
      customers,
      contacts,
      deals,
      products,
      suppliers,
      dealTasks,
      dealActivities,
      pipelineStages,
      getCustomerById,
      currentUser,
      users,
    });
  }, [
    open,
    query,
    customers,
    contacts,
    deals,
    products,
    suppliers,
    dealTasks,
    dealActivities,
    pipelineStages,
    getCustomerById,
    currentUser,
    users,
  ]);

  const flatResults = React.useMemo(
    () => groups.flatMap((group) => group.results),
    [groups]
  );

  const resultCount = flatResults.length;
  const trimmedQuery = query.trim();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return;
    }

    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  React.useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]'
    );
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, flatResults.length]);

  const handleSelect = React.useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (resultCount === 0) return;
      setActiveIndex((current) => (current + 1) % resultCount);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (resultCount === 0) return;
      setActiveIndex((current) => (current - 1 + resultCount) % resultCount);
      return;
    }

    if (event.key === "Enter" && flatResults[activeIndex]) {
      event.preventDefault();
      handleSelect(flatResults[activeIndex].href);
    }
  };

  let runningIndex = -1;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-lg md:hidden"
        aria-label="Search CRM"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      <button
        type="button"
        className="hidden h-9 w-56 items-center gap-2.5 rounded-lg border border-border/60 bg-muted/25 px-3 text-sm text-muted-foreground transition-smooth hover:bg-muted/45 hover:text-foreground md:flex lg:w-64"
        onClick={() => setOpen(true)}
        aria-label="Search CRM"
      >
        <Search className="h-4 w-4 shrink-0 opacity-70" />
        <span className="flex-1 truncate text-left">Search CRM…</span>
        <kbd className="pointer-events-none hidden rounded border border-border/70 bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-block">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed z-50 flex max-h-[min(85dvh,28rem)] w-[calc(100%-1.5rem)] max-w-lg flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl outline-none",
              "left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] -translate-x-1/2 sm:top-[14%]",
              "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            )}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              inputRef.current?.focus();
            }}
          >
            <DialogPrimitive.Title className="sr-only">
              Search CRM
            </DialogPrimitive.Title>

            <div className="flex items-center gap-2.5 border-b px-3 py-3 sm:px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search customers, deals, tasks…"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {trimmedQuery ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="shrink-0 rounded-md p-1 text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div
              ref={listRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5"
            >
              {!trimmedQuery ? (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Start typing to find customers, deals, contacts, and more.
                </p>
              ) : trimmedQuery.length < 2 ? (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Type at least 2 characters.
                </p>
              ) : resultCount === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{trimmedQuery}&rdquo;
                </p>
              ) : (
                groups.map((group) => (
                  <div key={group.type} className="py-1">
                    <p className="px-3 pb-1 pt-1.5 text-xs font-medium text-muted-foreground">
                      {getSearchTypeLabel(group.type)}
                    </p>
                    <div className="space-y-0.5">
                      {group.results.map((result) => {
                        runningIndex += 1;
                        const index = runningIndex;
                        const Icon = TYPE_ICONS[result.type];
                        const isActive = index === activeIndex;

                        return (
                          <SearchResultRow
                            key={`${result.type}-${result.id}`}
                            result={result}
                            query={query}
                            isActive={isActive}
                            icon={Icon}
                            onSelect={handleSelect}
                            onHover={() => setActiveIndex(index)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {resultCount > 0 ? (
              <div className="border-t px-3 py-2 text-center text-xs text-muted-foreground sm:text-left">
                {resultCount} result{resultCount === 1 ? "" : "s"}
                <span className="hidden sm:inline">
                  {" "}
                  · ↑↓ navigate · ↵ open · esc close
                </span>
              </div>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}

interface SearchResultRowProps {
  result: SearchResult;
  query: string;
  isActive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: (href: string) => void;
  onHover: () => void;
}

function SearchResultRow({
  result,
  query,
  isActive,
  icon: Icon,
  onSelect,
  onHover,
}: SearchResultRowProps) {
  return (
    <button
      type="button"
      data-active={isActive}
      onClick={() => onSelect(result.href)}
      onMouseEnter={onHover}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-smooth",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/70"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          isActive ? "opacity-90" : "text-muted-foreground"
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium leading-snug">
          <HighlightMatch text={result.title} query={query} />
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate text-xs",
            isActive ? "text-accent-foreground/80" : "text-muted-foreground"
          )}
        >
          {result.subtitle}
        </span>
      </span>
    </button>
  );
}
