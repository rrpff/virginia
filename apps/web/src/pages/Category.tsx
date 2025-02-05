import { rpc } from "../rpc";
import { useParams } from "wouter";
import Feed from "../components/Feed";
import NotFound from "./NotFound";

export default function CategoryPage() {
  const { category } = useParams();
  const categories = rpc.categories.useQuery();
  const feeds = rpc.category.useQuery(
    { vanity: category },
    { keepPreviousData: true }
  );

  if (!categories.data || !feeds.data) return null;
  if (feeds.data.length === 0) return <NotFound />;

  return (
    <article>
      <div className="flex flex-col gap-11">
        {feeds.data?.map((feed) => (
          <Feed key={feed.url} feed={feed} items={feed.items} />
        ))}
      </div>
    </article>
  );
}
