import { Link, useParams } from "wouter";
import { rpc } from "../rpc";
import Feed from "../components/Feed";
import NotFound from "./NotFound";

export default function CategoryPage() {
  const { category } = useParams();
  const feeds = rpc.category.useQuery(
    { vanity: category },
    { keepPreviousData: true }
  );

  if (!feeds.data) return null;
  if (feeds.isFetched && feeds.data === null) return <NotFound />;

  return (
    <article>
      <div className="flex flex-col gap-11">
        {feeds.data.map((feed) => (
          <Feed key={feed.url} feed={feed} items={feed.items} />
        ))}

        {feeds.data.length === 0 && (
          <div className="flex flex-col">
            <h1 className="text-3xl font-black">No feeds in this category</h1>
            <span>Maybe nobody you follow suits "{category}"?</span>
            <Link href="/" className="underline">
              See all feeds and add somebody
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
