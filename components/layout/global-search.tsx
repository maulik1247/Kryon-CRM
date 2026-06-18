"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Factory,
  Kanban,
  ListTodo,
  Package,
  ScrollText,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const TYPE_ICON_STYLES: Record<SearchResultType, string> = {
  customer: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  contact: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  deal: "bg-primary/10 text-primary",
  task: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  activity: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  product: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  supplier: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
};

const QUICK_HINTS = [
  "Customer name",
  "Deal ID",
  "Contact email",
  "Task title",
  "Product SKU",
];

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
      <mark className="rounded-sm bg-primary/15 px-0.5 font-medium text-foreground">
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
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

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
    itemRefs.current[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
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
        variant="outline"
        className="hidden h-9 w-52 items-center gap-2 rounded-lg border-border/60 bg-muted/20 px-3 text-muted-foreground shadow-sm transition-smooth hover:bg-muted/40 hover:text-foreground md:inline-flex"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 shrink-0 opacity-70" />
        <span className="flex-1 truncate text-left text-sm">Search…</span>
        <kbd className="pointer-events-none hidden rounded-md border border-border/70 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-block">
          ⌘K
        </kbd>
      </Button>

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "gap-0 overflow-hidden border-border/60 p-0 shadow-2xl sm:max-w-2xl",
            "top-[8%] translate-y-0 sm:top-[10%]",
            "[&>button]:right-3 [&>button]:top-3 [&>button]:opacity-60"
          )}
        >
          <div className="flex items-center gap-3 border-b px-4 py-3.5">
            <Search className="h-5 w-5 shrink-0 text-primary" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search customers, deals, tasks…"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/80"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
              >
                Clear
              </button>
            ) : null}
          </div>

          <ScrollArea className="max-h-[min(26rem,58vh)]">
            <div className="p-2">
              {!query.trim() ? (
                <div className="px-3 py-6">
                  <p className="text-sm font-medium text-foreground">
                    Quick search
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Jump to any record across the CRM.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {QUICK_HINTS.map((hint) => (
                      <span
                        key={hint}
                        className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {hint}
                      </span>
                    ))}
                  </div>
                </div>
              ) : resultCount === 0 ? (
                <div className="px-3 py-10 text-center">
                  <p className="text-sm font-medium text-foreground">
                    No matches found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a customer name, deal ID, or contact email.
                  </p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.type} className="mb-1 last:mb-0">
                    <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
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
                            ref={(node) => {
                              itemRefs.current[index] = node;
                            }}
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
          </ScrollArea>

          <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
            <span>
              {query.trim()
                ? `${resultCount} result${resultCount === 1 ? "" : "s"}`
                : "Search the entire workspace"}
            </span>
            <div className="hidden items-center gap-2 sm:flex">
              <kbd className="rounded border border-border/70 bg-background px-1.5 py-0.5 font-mono">
                ↑↓
              </kbd>
              <span>Navigate</span>
              <kbd className="rounded border border-border/70 bg-background px-1.5 py-0.5 font-mono">
                ↵
              </kbd>
              <span>Open</span>
              <kbd className="rounded border border-border/70 bg-background px-1.5 py-0.5 font-mono">
                esc
              </kbd>
              <span>Close</span>
            </div>
          </div>
        </DialogContent>
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

const SearchResultRow = React.forwardRef<
  HTMLButtonElement,
  SearchResultRowProps
>(function SearchResultRow(
  { result, query, isActive, icon: Icon, onSelect, onHover },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(result.href)}
      onMouseEnter={onHover}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-smooth",
        isActive
          ? "bg-primary/8 ring-1 ring-primary/20"
          : "hover:bg-muted/60"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          TYPE_ICON_STYLES[result.type]
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium leading-snug">
          <HighlightMatch text={result.title} query={query} />
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {result.subtitle}
        </span>
      </span>
      <ArrowRight
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-all",
          isActive
            ? "translate-x-0 opacity-100"
            : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
        )}
      />
    </button>
  );
});
