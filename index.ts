#!/usr/bin/env bun

import { getMediaDetails, searchForMedia } from "./lib/tmdb/api";

const query = Bun.argv.slice(Bun.argv.indexOf(import.meta.path) + 1).join(" ");

if (!query) {
  throw new Error("Please specify a query");
}

const search = await searchForMedia(query);

const [result] = search.results;

if (!result) {
  throw new Error(`No matches on TMDB for "${query}"`);
}

if (result.media_type === "movie") {
  console.log(
    `Matched movie: ${result.title}${
      result.release_date
        ? ` (${new Date(result.release_date).getFullYear()})`
        : ""
    }`
  );

  if (result.original_title && result.title !== result.original_title) {
    const originalLanguage = result.original_language;
    console.log(
      ` -> Original title${
        originalLanguage ? ` in ${originalLanguage.name}` : ""
      }: ${result.original_title}`
    );
  }
} else if (result.media_type === "tv") {
  console.log(
    `Matched TV show: ${result.name}${
      result.first_air_date
        ? ` (${new Date(result.first_air_date).getFullYear()})`
        : ""
    }`
  );

  if (result.original_name && result.name !== result.original_name) {
    const originalLanguage = result.original_language;
    console.log(
      ` -> Original name${
        originalLanguage ? ` in ${originalLanguage.name}` : ""
      }: ${result.original_name}`
    );
  }
}

const mediaDetails = await getMediaDetails(result);

const director = mediaDetails.credits.crew.find(
  (crew) => crew.job === "Director"
);
if (director) {
  console.log(` -> Director: ${director?.name}`);
}
console.log(
  ` -> Spoken languages: ${mediaDetails.spoken_languages
    .map((l) => l.english_name)
    .join(", ")}`
);

const backdropImage = mediaDetails.backdrop_path;
if (backdropImage) console.log(` -> Backdrop: ${backdropImage}`);

const posterImage = mediaDetails.poster_path;
if (posterImage) console.log(` -> Poster: ${posterImage}`);

const genres = mediaDetails.genres.map((g) => g.name).join(", ");
if (genres) console.log(` -> Genres: ${genres}`);
