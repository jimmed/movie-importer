import wretch from "wretch";
import queryString from "wretch/addons/queryString";
import { z } from "zod";

const tmdb = wretch("https://api.themoviedb.org/3/")
  .addon(queryString)
  .auth(`Bearer ${Bun.env.TMDB_READ_TOKEN}`);

const SearchForMediaResponse = z.object({
  page: z.number().int().nonnegative().default(0),
  results: z.array(
    z.object({
      adult: z.boolean().default(true),
      backdrop_path: z.string().nullable(),
      id: z.number().int().default(0),
      title: z.string().optional(),
      original_language: z.string(),
      original_title: z.string().optional(),
      overview: z.string(),
      poster_path: z.string().nullable(),
      media_type: z.enum(["movie", "tv"]),
      genre_ids: z.array(z.number().int()),
      popularity: z.number().default(0),
      release_date: z.string().optional(),
      video: z.boolean().default(true),
      vote_average: z.number().default(0),
      vote_count: z.number().int().default(0),
    }),
  ),
  total_pages: z.number().int().nonnegative().default(0),
  total_results: z.number().int().nonnegative().default(0),
});

export function searchForMedia(query: string) {
  return tmdb
    .url("/search/multi")
    .query({ query, language: "en-GB" })
    .get()
    .json(SearchForMediaResponse.parse);
}

const GetMovieDetailsResponse = z.object({
  adult: z.boolean().default(true),
  backdrop_path: z.string().nullable(),
  belongs_to_collection: z.string().nullable(),
  budget: z.number().int().default(0),
  genres: z.array(
    z.object({ id: z.number().int().default(0), name: z.string() }),
  ),
  homepage: z.string(),
  id: z.number().int().default(0),
  imdb_id: z.string(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number().default(0),
  poster_path: z.string(),
  production_companies: z.array(
    z.object({
      id: z.number().int().default(0),
      logo_path: z.string().nullable(),
      name: z.string(),
      origin_country: z.string(),
    }),
  ),
  production_countries: z.array(
    z.object({ iso_3166_1: z.string(), name: z.string() }),
  ),
  release_date: z.string(),
  revenue: z.number().int().default(0),
  runtime: z.number().int().default(0),
  spoken_languages: z.array(
    z.object({
      english_name: z.string(),
      iso_639_1: z.string(),
      name: z.string(),
    }),
  ),
  status: z.string(),
  tagline: z.string(),
  title: z.string(),
  video: z.boolean().default(true),
  vote_average: z.number().default(0),
  vote_count: z.number().int().default(0),
  credits: z.object({
    cast: z.array(z.object({}).loose()),
    crew: z.array(z.object({}).loose()),
  }),
});

export function getMovieDetails(movieId: number) {
  return tmdb
    .url(`/movie/${movieId}`)
    .query({ append_to_response: "credits" })
    .get()
    .json(GetMovieDetailsResponse.parse);
}

const GetTvSeriesDetailsResponse = z.object({}).loose();

export function getTvSeriesDetails(tvSeriesId: number) {
  return tmdb
    .url(`/tv/${tvSeriesId}`)
    .get()
    .json(GetTvSeriesDetailsResponse.parse);
}

export function getMediaDetails({
  media_type,
  id,
}: z.infer<typeof SearchForMediaResponse>["results"][number]) {
  switch (media_type) {
    case "movie":
      return getMovieDetails(id);
    case "tv":
      return getTvSeriesDetails(id);
    default:
      throw new Error(`Unsupported media type "${media_type}"`);
  }
}
