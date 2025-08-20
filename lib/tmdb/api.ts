import wretch from "wretch";
import queryString from "wretch/addons/queryString";
import {
  GetMovieDetailsResponse,
  GetTvSeriesDetailsResponse,
  SearchForMediaResponse,
  MediaSearchResult,
} from "./schema";
import type z from "zod";

const tmdb = wretch("https://api.themoviedb.org/3/")
  .addon(queryString)
  .auth(`Bearer ${Bun.env.TMDB_READ_TOKEN}`);

export function searchForMedia(query: string) {
  return tmdb
    .url("/search/multi")
    .query({ query, language: "en-GB" })
    .get()
    .json(SearchForMediaResponse.parse);
}

export function getMovieDetails(movieId: number) {
  return tmdb
    .url(`/movie/${movieId}`)
    .query({ append_to_response: "credits", language: "en-GB" })
    .get()
    .json(GetMovieDetailsResponse.parse);
}

export function getTvSeriesDetails(tvSeriesId: number) {
  return tmdb
    .url(`/tv/${tvSeriesId}`)
    .query({ append_to_response: "credits", language: "en-GB" })
    .get()
    .json(GetTvSeriesDetailsResponse.parse);
}

export function getMediaDetails({
  media_type,
  id,
}: z.infer<typeof MediaSearchResult>) {
  switch (media_type) {
    case "movie":
      return getMovieDetails(id);
    case "tv":
      return getTvSeriesDetails(id);
    default:
      throw new Error(`Unsupported media type "${media_type}"`);
  }
}
