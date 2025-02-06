import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import classNames from "classnames";
import { LuPlus } from "react-icons/lu";
import { rpc } from "../rpc";
import AddCategoryForm from "./AddCategoryForm";
import EmojiCheckbox from "./EmojiCheckbox";

export default function CategoriesSelector({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const categories = rpc.categories.useQuery();

  return (
    <div className="flex flex-row flex-wrap gap-1">
      {categories.data?.map((category) => (
        <EmojiCheckbox
          key={category.id}
          id={category.id}
          emoji={category.icon}
          value={category.id}
          title={category.name}
          checked={values.includes(category.id)}
          onChange={(e) => {
            const checked = e.currentTarget.checked;
            const filtered = values.filter((v) => v !== category.id);

            if (checked) {
              onChange([...filtered, category.id]);
            } else {
              onChange(filtered);
            }
          }}
        />
      ))}

      <Popover>
        <PopoverButton
          type="button"
          className={classNames(
            "flex items-center justify-center",
            "text-2xl w-12 h-12 rounded-sm",
            "border-2 border-transparent peer-checked:border-foreground"
          )}
        >
          <LuPlus />
        </PopoverButton>
        <PopoverPanel
          className="absolute -mt-12 z-10 bg-white"
          anchor="bottom start"
          portal
        >
          {({ close }) => (
            <div className="border-2 border-foreground p-4 rounded-sm">
              <AddCategoryForm
                onSubmit={(category) => {
                  onChange([...values, category.id]);
                  close();
                }}
              />
            </div>
          )}
        </PopoverPanel>
      </Popover>
    </div>
  );
}
