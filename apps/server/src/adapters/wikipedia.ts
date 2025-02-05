// import { Adapter } from "./index.js";
// import { RSSAdapter } from "./rss.js";

// export const WikipediaAdapter: Adapter = {
//   async getFeedDefinitions(url: string) {
//     const atomUrl = rewriteUrl(url);
//     return RSSAdapter.getFeedDefinitions(url);
//   },

//   async site(url: string) {
//     const atomUrl = rewriteUrl(url);
//     return RSSAdapter.site(atomUrl);
//   },

//   async feed(url: string) {
//     const atomUrl = rewriteUrl(url);
//     return RSSAdapter.feed(atomUrl);
//   },
// };

// function rewriteUrl(url: string) {
//   const { slug, locale } = resolveSlug(url);
//   if (!slug || !locale) return url;

//   return `https://${locale}.wikipedia.org/w/index.php?title=${slug}&feed=atom&action=history`;
// }

// const SLUG_MATCH = /\/\/(\w+)\.wikipedia\.org\/wiki\/([^\/]+)/; // e.g. https://en.wikipedia.org/wiki/Xiu_Xiu
// const PHP_MATCH = /\/\/(\w+)\.wikipedia\.org\/w\//; // e.g. https://en.wikipedia.org/w/index.php?title=Xiu_Xiu&action=history

// function resolveSlug(url: string) {
//   const slugMatch = url.match(SLUG_MATCH);
//   if (slugMatch) {
//     return {
//       locale: slugMatch[1],
//       slug: slugMatch[2],
//     };
//   }

//   const phpMatch = url.match(PHP_MATCH);
//   const slug = new URL(url).searchParams.get("title");
//   return {
//     locale: phpMatch ? phpMatch[1] : null,
//     slug: slug,
//   };
// }
