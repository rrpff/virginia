import { Link, useParams } from "wouter";
import { rpc } from "../rpc";
import Feed from "../components/Feed";
import NotFound from "./NotFound";

export default function CategoryPage() {
  const { category: categoryVanity } = useParams();
  const category = rpc.category.useQuery(
    { vanity: categoryVanity },
    { keepPreviousData: true }
  );

  if (!category.data) return null;
  if (category.isFetched && category.data === null) return <NotFound />;

  return (
    <article>
      <div className="flex flex-col gap-11">
        {category.data.feeds.map((feed) => (
          <Feed key={feed.id} feed={feed} sources={feed.sources} />
        ))}

        {category.data.feeds.length === 0 && !categoryVanity && (
          <div className="flex flex-col">
            <h1 className="text-3xl font-black">No feeds</h1>
            <span>This is where all your feeds will appear</span>
            <Link href="/add" className="underline">
              Go ahead and add a website!
            </Link>

            <img
              className="pt-8 w-96"
              src="https://media4.giphy.com/media/ISOckXUybVfQ4/giphy.gif?cid=6c09b952c7ifek463k6kr3lctzz2slset3spe44lvat76oj5&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g"
            />
          </div>
        )}

        {category.data.feeds.length === 0 && categoryVanity && (
          <div className="flex flex-col">
            <h1 className="text-3xl font-black">No feeds in this category</h1>
            <span>Maybe nobody you follow suits "{categoryVanity}"?</span>
            <Link href="/" className="underline">
              See all feeds and add somebody
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
