#!/usr/bin/env bun

import { getMediaDetails, searchForMedia } from "./lib/tmdb";

const query = Bun.argv.slice(Bun.argv.indexOf(import.meta.path) + 1).join(" ");

if (!query) {
  throw new Error("Please specify a query");
}

const search = await searchForMedia(query);

const [firstResult] = search.results;

if (!firstResult) {
  throw new Error(`No matches on TMDB for ${firstResult}`);
}

console.log(
  `Matched ${firstResult.media_type} ${firstResult.title} (${firstResult.release_date})`,
);

const mediaDetails = await getMediaDetails(firstResult);

console.info(mediaDetails);
