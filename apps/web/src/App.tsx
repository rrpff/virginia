import { FormEvent, useCallback, useEffect, useState } from "react";
import { rpc } from "./rpc";
import { Feed } from "@virginia/server";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<Feed>([]);

  const [url, setUrl] = useState("");

  useEffect(() => {
    rpc.demo.query().then((items) => {
      console.log(items);
      setFeed(items);
      setLoading(false);
    });
  }, []);

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!url.trim()) return;

      console.log(await rpc.addFeed.mutate({ url: url.trim() }));
      setUrl("");
    },
    [url]
  );

  return (
    <main>
      <header className="p-4 pb-2">
        <div>Virginia</div>
        <form onSubmit={submit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.currentTarget.value)}
          />
          <button>add</button>
        </form>
      </header>

      <article className="p-4 pt-2">
        {loading && <span>loading...</span>}
        <ul className="flex flex-col gap-4">
          {feed.map((item) => (
            <li key={item.url} className="max-w-120">
              <a href={item.url} className="block visited:text-purple-400">
                <span className="font-bold text-lg">{item.title}</span>
                <span className="line-clamp-3">{item.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}
