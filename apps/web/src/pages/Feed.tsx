import { useParams } from "wouter";
import Feed from "../components/Feed";
import { rpc } from "../rpc";
import NotFound from "./NotFound";

export default function FeedPage() {
  const { id } = useParams();

  const feed = rpc.feed.useQuery({ id: id! }, { enabled: id !== undefined });

  if (!id) return <NotFound />;
  if (!feed.data) return null;

  return <Feed feed={feed.data} items={feed.data.items} />;
}
