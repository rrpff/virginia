import classNames from "classnames";
import { Link, useLocation } from "wouter";
import { rpc, RpcOutputs } from "../rpc";
import { getQueryKey } from "@trpc/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
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
import { restrictToParentElement } from "@dnd-kit/modifiers";

export default function Sidebar() {
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
      <CategoryNav />
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

function CategoryNav() {
  const { categories, setPosition } = useSortableCategories();
  const [location] = useLocation();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.over && event.active.id !== event.over.id) {
        const fromIndex = categories.findIndex((c) => c.id === event.active.id);
        const toIndex = categories.findIndex((c) => c.id === event.over!.id);

        if (fromIndex !== undefined && toIndex !== undefined) {
          setPosition(fromIndex, toIndex);
        }
      }
    },
    [categories, setPosition]
  );

  return (
    <div className="flex flex-col gap-1">
      <CategoryLink
        id="root"
        href="/"
        icon="🌍"
        isDraggable={false}
        isActive={"/" === location}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext
          items={categories}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => {
            const href = `/c/${category.vanity}`;
            return (
              <CategoryLink
                key={href}
                href={href}
                id={category.id}
                icon={category.icon}
                isDraggable
                isActive={href === location}
              />
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}

function CategoryLink({
  id,
  href,
  icon,
  isActive,
  isDraggable = true,
}: {
  id: string;
  href: string;
  icon: string;
  isActive: boolean;
  isDraggable?: boolean;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !isDraggable,
  });

  const dragStyle = transform
    ? {
        transform: `translate3d(0px, ${transform.y}px, 0)`,
        transition,
        pointerEvents: "none" as const,
      }
    : undefined;

  return (
    <Link
      ref={setNodeRef}
      href={href}
      style={dragStyle}
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

type SortableCategory = RpcOutputs["categories"][number];
function useSortableCategories() {
  const categories = rpc.categories.useQuery();
  const [sorted, setSorted] = useState<SortableCategory[]>([]);

  useEffect(() => {
    setSorted(categories.data ?? []);
  }, [categories.data]);

  const setPosition = useCallback((from: number, to: number) => {
    setSorted((current) => {
      return arrayMove(current, from, to);
    });
  }, []);

  return {
    categories: sorted,
    setPosition,
  };
}
