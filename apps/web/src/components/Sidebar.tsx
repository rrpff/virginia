import classNames from "classnames";
import { Link, useLocation } from "wouter";
import { rpc } from "../rpc";
import { getQueryKey } from "@trpc/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { LuPlus, LuRefreshCw } from "react-icons/lu";

export default function Sidebar() {
  const [location] = useLocation();
  const categories = rpc.categories.useQuery();
  const refresh = rpc.refresh.useMutation();
  const queryClient = useQueryClient();

  const reload = useCallback(async () => {
    await refresh.mutateAsync();

    queryClient.invalidateQueries(getQueryKey(rpc.feeds));
  }, [queryClient, refresh]);

  if (!categories.data) return null;

  return (
    <header className="flex flex-col items-center gap-4">
      <CategoryLink href="/" icon="🌍" isActive={location === "/"} />
      {categories.data.map((cat) => (
        <CategoryLink
          key={cat}
          icon={cat}
          href={`/${cat}`}
          isActive={location === `/${cat}`}
        />
      ))}
      <section className="flex flex-col gap-1 mt-2">
        <button
          className="v-button bg-background! text-foreground! text-lg aspect-square"
          disabled={refresh.isLoading}
          onClick={() => reload()}
        >
          <LuRefreshCw
            style={{
              transition: "transform 0.4s",
              animation: refresh.isLoading ? "spin 1s infinite" : "",
            }}
          />
        </button>
        <Link
          className="v-button bg-background! text-foreground! flex items-center text-xl aspect-square"
          href="/add"
        >
          <LuPlus />
        </Link>
      </section>
    </header>
  );
}

function CategoryLink({
  href,
  icon,
  isActive,
}: {
  href: string;
  icon: string;
  isActive: boolean;
}) {
  return (
    <div className="relative mb-9">
      <Link
        href={href}
        className={classNames(
          "text-2xl absolute -left-13 pl-10 pr-4 py-2 rounded-r-md",
          isActive ? "bg-white" : "bg-background hover:bg-foreground/10"
        )}
      >
        {icon}
      </Link>
    </div>
  );
}
