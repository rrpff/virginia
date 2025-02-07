import { Adapter } from "./index.js";
import { RSSAdapter } from "./rss.js";

export const BlueskyAdapter: Adapter = {
  async getSources(url: string) {
    const [source] = await RSSAdapter.getSources(url);
    if (!source) return [];

    const avatar = await getAvatar(source.url);
    if (avatar) {
      source.iconUrl = avatar;
    }

    return [source];
  },

  async latest(url: string) {
    return RSSAdapter.latest(url);
  },
};

async function getAvatar(url: string) {
  const did = getProfileDid(url);
  if (!did) return null;

  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURI(
        did
      )}`
    );
    const json = (await res.json()) as { avatar?: string };
    return json.avatar ?? null;
  } catch (err) {
    console.error("Unable to get Bluesky icon:", err);
  }
}

const MATCH = /^\/profile\/([^\/]+)\/rss$/; // https://bsky.app/profile/did:plc:e72cwu7fen37hzzzhwy6mkxp/rss
function getProfileDid(url: string) {
  const uri = new URL(url);
  const match = uri.pathname.match(MATCH);
  if (!match) return null;

  return match[1];
}
