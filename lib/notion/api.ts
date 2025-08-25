import wretch from "wretch";
import queryString from "wretch/addons/queryString";
import z from "zod";
import type { GetMediaDetailsResponse } from "../tmdb/schema";
import { UpdatePageResponse } from "./schema";

const { IMPORTER_NOTION_TOKEN, IMPORTER_NOTION_DB } = Bun.env;

const notion = wretch("https://api.notion.com/v1")
  .auth(`Bearer ${IMPORTER_NOTION_TOKEN}`)
  .headers({ "Notion-Version": "2022-06-28" })
  .addon(queryString);

function notionText(content?: string | null) {
  if (!content) return [];
  return [{ text: { content } }];
}

export async function uploadImageToNotion(url: string) {
  let result = await notion
    .url("/file_uploads")
    .json({ mode: "external_url", external_url: url, filename: "image.png" })
    .post()
    .json((x) => x);

  do {
    result = await notion
      .url(`/file_uploads/${result.id}`)
      .get()
      .json((x) => x);
    if (result.status === "upload_failed") {
      throw new Error("Upload failed: " + JSON.stringify(result, null, 2));
    }
  } while (result.status === "pending");
  return result.id;
}

export async function addMediaToNotion(
  item: z.infer<typeof GetMediaDetailsResponse>,
  posterImageId?: string
) {
  const directorName =
    "credits" in item
      ? item.credits.crew.find((c) => c.job === "Director")?.name
      : undefined;
  return notion
    .url("/pages")
    .json({
      parent: { database_id: IMPORTER_NOTION_DB },
      icon: {
        emoji:
          item.media_type === "tv"
            ? "📺"
            : item.media_type === "movie"
            ? "🎥"
            : "📁",
      },
      cover: item.backdrop_path
        ? { external: { url: item.backdrop_path } }
        : undefined,
      properties: {
        Name: {
          title: notionText(
            item.media_type === "tv" || item.media_type === "collection"
              ? item.name
              : item.title
          ),
        },
        Genre:
          "genres" in item
            ? { multi_select: item.genres.map((item) => ({ name: item.name })) }
            : undefined,
        IMDB:
          "imdb_id" in item && item.imdb_id
            ? { url: `https://imdb.com/title/${item.imdb_id}` }
            : undefined,
        Rating:
          "vote_average" in item && item.vote_average
            ? { number: item.vote_average }
            : undefined,
        Type: {
          select: {
            name:
              item.media_type === "tv"
                ? "TV Series"
                : item.media_type === "movie"
                ? "Movie"
                : "Collection",
          },
        },
        Year:
          item.media_type === "tv" && item.first_air_date
            ? { number: new Date(item.first_air_date).getFullYear() }
            : item.media_type === "movie" && item.release_date
            ? { number: item.release_date.getFullYear() }
            : undefined,
        "Release Date":
          item.media_type === "tv" && item.first_air_date
            ? { date: { start: new Date(item.first_air_date).toISOString() } }
            : item.media_type === "movie" && item.release_date
            ? { date: { start: item.release_date.toISOString() } }
            : undefined,
        Summary: item.overview
          ? { rich_text: notionText(item.overview) }
          : undefined,
        "Cover image": posterImageId
          ? { files: [{ file_upload: { id: posterImageId } }] }
          : undefined,
        Director: directorName
          ? { rich_text: notionText(directorName) }
          : undefined,
        Status: { select: { name: "Not watched" } },
      },
    })
    .post()
    .json(UpdatePageResponse.parse);
}
