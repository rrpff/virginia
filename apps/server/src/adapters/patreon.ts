import * as cheerio from "cheerio";
import { Adapter } from "./index.js";
import { hashObject } from "../utils/hash.js";

export const PatreonAdapter: Adapter = {
  async getSources(url) {
    const meta = await getPatreonMeta(url);
    const envelope = meta.props.pageProps.bootstrapEnvelope;
    const name = envelope.meta.title;
    const iconUrl =
      envelope.pageBootstrap.campaign.data.attributes.avatar_photo_image_urls
        .thumbnail_small;

    return [
      {
        url,
        name: name ?? null,
        iconUrl: iconUrl ?? null,
      },
    ];
  },

  async latest(url: string) {
    const json = await getPatreonData(url);
    return json.data
      .filter((item) => item.type === "post")
      .map((item) => {
        const mapped = {
          id: item.attributes.url,
          url: item.attributes.url,
          title: item.attributes.title,
          description: item.attributes.teaser_text ?? null,
          imageUrl: item.attributes.image?.large_url ?? null,
          timestamp: new Date(item.attributes.published_at),
        };

        return {
          ...mapped,
          hash: hashObject(mapped),
        };
      });
  },
};

async function getPatreonData(url: string) {
  const meta = await getPatreonMeta(url);
  const creatorId =
    meta.props.pageProps.bootstrapEnvelope.pageBootstrap.campaign.data.id;

  const u = new URL("https://www.patreon.com/api/posts");
  u.searchParams.set("filter[campaign_id]", creatorId);
  u.searchParams.set("sort", "-published_at");

  const res = await fetch(u);
  return (await res.json()) as PatreonPostsResponse;
}

async function getPatreonMeta(url: string) {
  const ires = await fetch(url);
  const itext = await ires.text();
  const $ = cheerio.load(itext);
  const meta = $("script#__NEXT_DATA__").text();
  return JSON.parse(meta);
}

type PatreonPostsResponse = {
  data: {
    type: "post"; // or other
    attributes: {
      published_at: string; // iso date
      title: string;
      teaser_text: string;
      url: string;
      image?: {
        width: number;
        height: number;
        large_url: string;
        thumb_square_large_url: string;
        thumb_square_url: string;
        thumb_url: string;
        url: string;
      };
    };
  }[];
};
