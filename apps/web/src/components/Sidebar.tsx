import classNames from "classnames";
import { Link, useLocation } from "wouter";
import { rpc } from "../rpc";
import { getQueryKey } from "@trpc/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LuPlus, LuRefreshCw } from "react-icons/lu";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function Sidebar() {
  const categories = rpc.categories.useQuery();
  const refresh = rpc.refresh.useMutation();
  const queryClient = useQueryClient();

  const reload = useCallback(async () => {
    await refresh.mutateAsync();

    queryClient.invalidateQueries(getQueryKey(rpc.feeds));
  }, [queryClient, refresh]);

  const links = useMemo(() => {
    if (!categories.data) return [];

    return [
      // TODO: move this in
      { href: "/", icon: "🌍", isDraggable: false },
      ...categories.data.map((category) => ({
        href: `/c/${category.vanity}`,
        icon: category.icon,
        isDraggable: true,
      })),
    ];
  }, [categories.data]);

  if (!categories.data) return null;

  return (
    <header className="flex flex-col items-center gap-4">
      <CategoryNav links={links} />
      <section className="flex flex-col gap-1 mt-2 pl-4">
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

function CategoryNav({
  links,
}: {
  links: { href: string; icon: string; isDraggable: boolean }[];
}) {
  const [location] = useLocation();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [orders, setOrders] = useState<string[]>([]);
  useEffect(() => {
    setOrders(links.map((l) => l.href));
  }, [links]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!event.over) return;

      const link = links.find((l) => l.href === event.over!.id);
      if (!link || !link.isDraggable) return;

      if (event.active.id !== event.over.id) {
        setOrders((current) => {
          const oldIndex = current.indexOf(event.active.id as string);
          const newIndex = current.indexOf(event.over!.id as string);

          return arrayMove(current, oldIndex, newIndex);
        });
      }
    },
    [links]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={orders} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1">
          {links.map((link) => {
            const order = orders.findIndex((o) => o === link.href);
            return (
              <CategoryLink
                href={link.href}
                icon={link.icon}
                isDraggable={link.isDraggable}
                isActive={link.href === location}
                order={order}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function CategoryLink({
  href,
  icon,
  isActive,
  isDraggable = true,
  order,
}: {
  href: string;
  icon: string;
  isActive: boolean;
  isDraggable?: boolean;
  order: number;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: href,
    disabled: !isDraggable,
  });

  const dragStyle = transform
    ? { transform: `translate3d(0px, ${transform.y}px, 0)`, transition }
    : undefined;

  return (
    <Link
      ref={setNodeRef}
      href={href}
      style={{ order, ...dragStyle }} // TODO: fix this order behaviour
      {...listeners}
      {...attributes}
      className={classNames(
        "relative group overflow-hidden",
        "text-2xl pl-8 pr-4 py-2 rounded-r-md",
        isActive ? "bg-white" : "bg-background hover:bg-foreground/10",
        isDragging ? "bg-foreground/10 z-10" : "", // TODO: stop opacity
        "active:border-foreground"
      )}
    >
      <span className="relative">{icon}</span>
    </Link>
  );
}
