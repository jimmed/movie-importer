import wretch from "wretch";
import queryString from "wretch/addons/queryString";
import {
  GetMovieDetailsResponse,
  GetTvSeriesDetailsResponse,
  GetCollectionDetailsResponse,
  SearchForMediaResponse,
  MediaSearchResult,
} from "./schema";
import type z from "zod";

const { IMPORTER_TMDB_READ_TOKEN } = Bun.env;

const tmdb = wretch("https://api.themoviedb.org/3/")
  .addon(queryString)
  .auth(`Bearer ${IMPORTER_TMDB_READ_TOKEN}`);

export function searchForMedia(query: string) {
  return tmdb
    .url("/search/multi")
    .query({ query, language: "en-GB" })
    .get()
    .json((v) => SearchForMediaResponse.parse(v));
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

export function getCollectionDetails(collectionId: number) {
  return tmdb
    .url(`/collection/${collectionId}`)
    .query({ language: "en-GB" })
    .get()
    .json(GetCollectionDetailsResponse.parse);
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
    case "collection":
      return getCollectionDetails(id);
    default:
      throw new Error(`Unsupported media type "${media_type}"`);
  }
}
