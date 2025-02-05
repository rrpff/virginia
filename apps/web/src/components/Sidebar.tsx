import classNames from "classnames";
import { Link, useLocation } from "wouter";
import { rpc, RpcOutputs } from "../rpc";
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
import { useLiveContext } from "../contexts/live";

export default function Sidebar() {
  const refresh = rpc.refresh.useMutation();
  const utils = rpc.useUtils();
  const { isRefreshing } = useLiveContext();

  const reload = useCallback(async () => {
    await refresh.mutateAsync();

    utils.category.invalidate();
  }, [refresh, utils.category]);

  return (
    <header className="flex flex-col items-center gap-4">
      <CategoryNav />
      <section className="flex flex-col gap-1 mt-2 pl-4">
        <button
          className="v-button bg-background! text-foreground! text-lg aspect-square"
          disabled={isRefreshing}
          onClick={() => reload()}
        >
          <LuRefreshCw
            style={{
              transition: "transform 0.4s",
              animation: isRefreshing ? "spin 1s infinite" : "",
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
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
      <div className="flex flex-col gap-1">
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
    ? { transform: `translate3d(0px, ${transform.y}px, 0)`, transition }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={classNames(
        "relative group overflow-hidden",
        "text-2xl rounded-r-md cursor-default",
        isActive ? "bg-white" : "bg-background hover:bg-foreground/10",
        isDragging ? "bg-foreground/10 z-10" : "" // TODO: stop opacity
      )}
      {...listeners}
      {...attributes}
    >
      <Link
        className={classNames(
          "block pl-8 pr-4 py-2 cursor-default",
          isDragging ? "pointer-events-none" : "pointer-events-auto"
        )}
        href={href}
      >
        <span className="relative">{icon}</span>
      </Link>
    </div>
  );
}

type SortableCategory = RpcOutputs["categories"][number];
function useSortableCategories() {
  const categories = rpc.categories.useQuery();
  const setDbPosition = rpc.setCategoryPosition.useMutation();
  const [sorted, setSorted] = useState<SortableCategory[]>([]);

  useEffect(() => {
    setSorted(categories.data ?? []);
  }, [categories.data]);

  const setPosition = useCallback(
    (from: number, to: number) => {
      const category = sorted[from];

      setSorted((current) => {
        return arrayMove(current, from, to);
      });

      if (category) {
        setDbPosition.mutate({ categoryId: category.id, position: to });
      }
    },
    [setDbPosition, sorted]
  );

  return {
    categories: sorted,
    setPosition,
  };
}
