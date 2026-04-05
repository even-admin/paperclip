import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { Menu, ListChecks } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { useSidebar } from "../context/SidebarContext";
import { useCompany } from "../context/CompanyContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { issuesApi } from "../api/issues";
import { queryKeys } from "../lib/queryKeys";
import { cn } from "../lib/utils";
import { PluginSlotOutlet, usePluginSlots } from "@/plugins/slots";
import { PluginLauncherOutlet, usePluginLaunchers } from "@/plugins/launchers";

type GlobalToolbarContext = { companyId: string | null; companyPrefix: string | null };

function GlobalToolbarPlugins({ context }: { context: GlobalToolbarContext }) {
  const { slots } = usePluginSlots({ slotTypes: ["globalToolbarButton"], companyId: context.companyId });
  const { launchers } = usePluginLaunchers({ placementZones: ["globalToolbarButton"], companyId: context.companyId, enabled: !!context.companyId });
  if (slots.length === 0 && launchers.length === 0) return null;
  return (
    <div className="flex items-center gap-1 shrink-0">
      <PluginSlotOutlet slotTypes={["globalToolbarButton"]} context={context} className="flex items-center gap-1" />
      <PluginLauncherOutlet placementZones={["globalToolbarButton"]} context={context} className="flex items-center gap-1" />
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const formatted = time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <span className="text-xs text-muted-foreground tabular-nums select-none">
      {formatted}
    </span>
  );
}

function TaskPopover({ companyId }: { companyId: string | null }) {
  const { data: issues } = useQuery({
    queryKey: queryKeys.issues.list(companyId!),
    queryFn: () => issuesApi.list(companyId!, { status: "in_progress" }),
    enabled: !!companyId,
    refetchInterval: 30_000,
  });

  const active = issues?.slice(0, 8) ?? [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative text-muted-foreground hover:text-foreground">
          <ListChecks className="h-4 w-4" />
          {active.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-medium">Active tasks</p>
        </div>
        {active.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No tasks in progress
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {active.map((issue) => (
              <Link
                key={issue.id}
                to={`/issues/${issue.identifier ?? issue.id}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border last:border-0"
              >
                <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">
                    <span className="text-muted-foreground">{issue.identifier ?? issue.id.slice(0, 8)}</span>
                    {" — "}
                    {issue.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function TopBar() {
  const { breadcrumbs } = useBreadcrumbs();
  const { toggleSidebar, isMobile } = useSidebar();
  const { selectedCompanyId, selectedCompany } = useCompany();

  const globalToolbarSlotContext = useMemo(
    () => ({
      companyId: selectedCompanyId ?? null,
      companyPrefix: selectedCompany?.issuePrefix ?? null,
    }),
    [selectedCompanyId, selectedCompany?.issuePrefix],
  );

  const menuButton = isMobile && (
    <Button
      variant="ghost"
      size="icon-sm"
      className="mr-2 shrink-0 text-muted-foreground"
      onClick={toggleSidebar}
      aria-label="Open sidebar"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );

  // Page name for left side
  const pageTitle = breadcrumbs.length > 0 ? breadcrumbs[0].label : null;

  // Breadcrumb trail for detail pages
  const breadcrumbTrail = breadcrumbs.length > 1 ? (
    <Breadcrumb className="min-w-0 overflow-hidden">
      <BreadcrumbList className="flex-nowrap">
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <Fragment key={i}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className={isLast ? "min-w-0" : "shrink-0"}>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  ) : null;

  return (
    <div className="border-b border-[#1E1E1E] dark:border-[#1E1E1E] px-4 md:px-6 h-12 shrink-0 flex items-center">
      {/* Left: sidebar toggle + page name */}
      <div className="flex items-center min-w-0 flex-1">
        {menuButton}
        {breadcrumbTrail ?? (
          <span className="text-sm text-muted-foreground truncate" style={{ fontFamily: "var(--font-body)" }}>
            {pageTitle?.toLowerCase() ?? ""}
          </span>
        )}
      </div>

      {/* Right: plugins + tasks + clock + avatar */}
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <GlobalToolbarPlugins context={globalToolbarSlotContext} />
        <TaskPopover companyId={selectedCompanyId ?? null} />
        <LiveClock />
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-[11px] bg-accent text-accent-foreground">
            L
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
