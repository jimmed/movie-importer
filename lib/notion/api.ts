import wretch from "wretch";
import queryString from "wretch/addons/queryString";
import z from "zod";
import type { GetMediaDetailsResponse } from "../tmdb/schema";
import { UpdatePageResponse } from "./schema";

const notion = wretch("https://api.notion.com/v1")
  .auth(`Bearer ${Bun.env.NOTION_TOKEN}`)
  .headers({ "Notion-Version": "2022-06-28" })
  .addon(queryString);

export async function addMediaToNotion(
  item: z.infer<typeof GetMediaDetailsResponse>
) {
  return notion
    .url("/pages")
    .json({
      parent: { database_id: Bun.env.NOTION_DATABASE },
      icon: { emoji: item.media_type === "tv" ? "📺" : "🎥" },
      cover: item.backdrop_path
        ? { external: { url: item.backdrop_path } }
        : undefined,
      properties: {
        Name: {
          title: [
            {
              text: {
                content: item.media_type === "tv" ? item.name : item.title,
              },
            },
          ],
        },
        Genre: {
          multi_select: item.genres.map((item) => ({ name: item.name })),
        },
        IMDB: {
          url: item.imdb_id ? `https://imdb.com/title/${item.imdb_id}` : "",
        },
        Rating: { number: item.vote_average },
        Type: {
          select: { name: item.media_type === "tv" ? "TV Series" : "Movie" },
        },
      },
    })
    .post()
    .json(UpdatePageResponse.parse);
}
