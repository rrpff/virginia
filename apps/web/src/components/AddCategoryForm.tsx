import { useForm } from "react-hook-form";
import { rpc, RpcOutputs } from "../rpc";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";
import EmojiInput from "./EmojiInput";

const Schema = z.object({
  name: z.string().min(1, "can't be empty!"),
  icon: z.string().regex(/\p{Extended_Pictographic}{1}/u, "just emoji ok!"),
});

export default function AddCategoryForm({
  onSubmit,
}: {
  onSubmit?: (category: RpcOutputs["addCategory"]) => void;
}) {
  const utils = rpc.useUtils();
  const addCategory = rpc.addCategory.useMutation();

  const form = useForm<z.infer<typeof Schema>>({
    values: { name: "", icon: "" },
    resolver: zodResolver(Schema),
  });

  const submit = form.handleSubmit(async (values) => {
    const category = await addCategory.mutateAsync(values);
    await utils.categories.invalidate();

    form.reset();
    onSubmit?.(category);
  });

  const icon = form.watch("icon");

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-bold" htmlFor="name">
          Name
        </label>
        <input
          type="text"
          className="v-input"
          placeholder="friends"
          {...form.register("name")}
        />
        <ErrorMessage name="name" errors={form.formState.errors} />
      </div>
      <div>
        <label className="block text-sm font-bold" htmlFor="icon">
          Icon
        </label>
        <EmojiInput
          id="icon"
          type="text"
          className="v-input"
          placeholder="🌈"
          value={icon}
          onChange={(value) => form.setValue("icon", value)}
        />
        <ErrorMessage name="icon" errors={form.formState.errors} />
      </div>
      <div>
        <button
          type="submit"
          className="v-button px-8!"
          disabled={form.formState.isSubmitting}
        >
          Add
        </button>
      </div>
    </form>
  );
}
