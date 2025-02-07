import classNames from "classnames";
import { Link, useLocation } from "wouter";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuTrigger,
} from "@radix-ui/react-context-menu";
import { rpc, RpcOutputs } from "../rpc";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { LuPlus, LuRefreshCw } from "react-icons/lu";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { useLiveContext } from "../contexts/live";
import Logo from "./Logo.svg?react";

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
    })
    // TODO: means you can't open links lol
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: sortableKeyboardCoordinates,
    // })
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
        name="All"
        icon={
          <Logo className="w-full text-foreground" width={32} height={32} />
        }
        isDraggable={false}
        isDeletable={false}
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
                  name={category.name}
                  icon={category.icon}
                  isDraggable
                  isDeletable
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
  name,
  icon,
  isActive,
  isDraggable,
  isDeletable,
}: {
  id: string;
  href: string;
  name: string;
  icon: string | ReactElement;
  isActive: boolean;
  isDraggable?: boolean;
  isDeletable?: boolean;
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

  const deleteCategory = rpc.deleteCategory.useMutation();
  const utils = rpc.useUtils();

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={classNames(
        "relative group overflow-hidden",
        "text-2xl rounded-r-md cursor-default",
        "outline-4 outline-transparent focus:outline-focus",
        isActive ? "bg-white" : "bg-background hover:bg-faint",
        isDragging ? "bg-faint z-10" : "" // TODO: stop opacity
      )}
      {...listeners}
      {...attributes} // TODO: fix focus
    >
      <ContextMenu>
        <ContextMenuTrigger disabled={!isDeletable}>
          <Link
            className={classNames(
              "block pl-8 pr-4 py-2 cursor-default",
              isDragging ? "pointer-events-none" : "pointer-events-auto"
            )}
            title={name}
            href={href}
          >
            <span className="relative">{icon}</span>
          </Link>
        </ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent className="border-2 border-foreground bg-white p-1 text-xs rounded-sm">
            {isDeletable && (
              <ContextMenuItem
                className="px-2 py-1 focus:bg-foreground focus:text-background focus:outline-none cursor-default"
                onClick={async () => {
                  if (confirm("Are you sure?")) {
                    await deleteCategory.mutateAsync({ categoryId: id });
                    await utils.categories.invalidate();
                  }
                }}
              >
                Delete {name}
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
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
