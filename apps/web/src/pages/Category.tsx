import { rpc } from "../rpc";
import { Link, useParams } from "wouter";
import { LuArrowRight } from "react-icons/lu";
import Feed from "../components/Feed";
import NotFound from "./NotFound";

export default function CategoryPage() {
  const { category } = useParams();
  const categories = rpc.categories.useQuery();
  const feeds = rpc.feeds.useQuery({ category }, { keepPreviousData: true });

  if (!categories.data || !feeds.data) return null;
  if (feeds.data.length === 0) return <NotFound />;

  return (
    <article>
      <ul className="flex flex-col gap-8">
        {feeds.data?.map((feed) => (
          <li key={feed.url}>
            <Feed feed={feed} items={feed.items} />
            <Link
              href={`/f/${feed.id}`}
              className="ml-10 mt-2 inline-block p-1 rounded-sm bg-white/50 text-foreground text-sm"
            >
              <LuArrowRight />
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
