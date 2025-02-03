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
    <div className="bg-yellow-50 text-red-400">
      <div>Virginia</div>
      {loading && <span>loading...</span>}
      <div>
        {feed.map((item) => (
          <div key={item.url}>
            {item.title}
            {item.description}
          </div>
        ))}
      </div>
    </div>
  );
}
