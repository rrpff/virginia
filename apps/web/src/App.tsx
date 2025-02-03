import { useEffect, useState } from "react";
import { rpc } from "./rpc";
import { Feed } from "@virginia/server";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<Feed>([]);

  useEffect(() => {
    rpc.feeds.query().then((items) => {
      console.log(items);
      setFeed(items);
      setLoading(false);
    });
  }, []);

  return (
    <main>
      <header className="p-4 pb-2">
        <span>Virginia</span>
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
