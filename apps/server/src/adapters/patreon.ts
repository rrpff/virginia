import * as cheerio from "cheerio";
import { Adapter } from "./index.js";

export const PatreonAdapter: Adapter = {
  hostname: "www.patreon.com",
  site: async (url: string) => {
    const meta = await getPatreonMeta(url);

    return {
      name: meta.props.pageProps.bootstrapEnvelope.meta.title,
      iconUrl:
        meta.props.pageProps.bootstrapEnvelope.pageBootstrap.campaign.data
          .attributes.avatar_photo_image_urls.thumbnail_small,
    };
  },
  feed: async (url: string) => {
    const json = await getPatreonData(url);
    return json.data
      .filter((item) => item.type === "post")
      .map((item) => {
        return {
          url: item.attributes.url,
          title: item.attributes.title,
          description: item.attributes.teaser_text,
          imageUrl: item.attributes.image?.large_url, // TODO: implement
          timestamp: Date.parse(item.attributes.published_at),
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
