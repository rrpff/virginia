import { useLocation } from "wouter";
import { useState, useCallback, FormEvent } from "react";
import { rpc } from "../rpc";

export default function AddFeedPage() {
  const [, setLocation] = useLocation();
  const addFeed = rpc.addFeed.useMutation();

  const [url, setUrl] = useState("");
  const [categories, setCategories] = useState("");
  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      await addFeed.mutateAsync({
        url: url.trim(),
        categories: categories.trim(),
      });
      setLocation("/");
    },
    [addFeed, categories, setLocation, url]
  );

  return (
    <main>
      <h1 className="font-bold text-xl mb-2">Add a new website</h1>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <div>
          <label className="block text-sm font-bold" htmlFor="url">
            URL
          </label>
          <input
            id="url"
            type="text"
            className="v-input"
            placeholder="website"
            value={url}
            onChange={(e) => setUrl(e.currentTarget.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold" htmlFor="categories">
            Categories
          </label>
          <input
            id="categories"
            type="text"
            className="v-input"
            placeholder="space separated emojis"
            value={categories}
            onChange={(e) => setCategories(e.currentTarget.value)}
          />
        </div>
        <div>
          <button className="v-button px-8!">Add</button>
        </div>
        <div className="text-red-500 text-sm">
          {addFeed.error && "Something bad went wrong"}
        </div>
      </form>
    </main>
  );
}
