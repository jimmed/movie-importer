import { z } from "zod";
import ISO6391 from "iso-639-1";

const IntDefault0 = z.number().int().default(0);
const NumberDefault0 = z.number().default(0);
const BooleanDefaultTrue = z.boolean().default(true);
const OptionalDate = z.iso.date().or(z.literal("")).optional();
const OriginalLanguage = z
  .string()
  .transform((value) => ({ iso_639_1: value, name: ISO6391.getName(value) }))
  .optional();
const ImagePath = z
  .string()
  .transform((path) => `https://image.tmdb.org/t/p/original${path}`);

const BaseEntity = z.object({ id: IntDefault0 });
const NamedEntity = BaseEntity.extend({ name: z.string() });

const Person = NamedEntity.extend({
  credit_id: z.string(),
  gender: IntDefault0,
  profile_path: ImagePath.nullable(),
});

const CreditedPerson = Person.extend({
  known_for_department: z.string(),
  original_name: z.string(),
  popularity: NumberDefault0,
});

const TvSearchResult = NamedEntity.extend({
  media_type: z.literal("tv"),
  backdrop_path: ImagePath.nullish(),
  original_language: OriginalLanguage,
  original_name: z.string().nullish(),
  overview: z.string(),
  poster_path: ImagePath.nullable(),
  genre_ids: z.array(z.number().int()),
  popularity: NumberDefault0,
  video: BooleanDefaultTrue,
  vote_average: NumberDefault0,
  first_air_date: z.iso.date(),
  origin_country: z.array(z.string()),
});
const MovieSearchResult = BaseEntity.extend({
  media_type: z.literal("movie"),
  backdrop_path: ImagePath.nullish(),
  title: z.string().optional(),
  original_language: OriginalLanguage,
  original_title: z.string().optional(),
  overview: z.string().optional(),
  poster_path: ImagePath.nullish(),
  genre_ids: z.array(z.number().int()).optional(),
  popularity: NumberDefault0,
  release_date: OptionalDate,
  video: BooleanDefaultTrue,
  vote_average: NumberDefault0,
  vote_count: IntDefault0,
}).loose();
export const MediaSearchResult = z.discriminatedUnion("media_type", [
  TvSearchResult,
  MovieSearchResult,
  z.object({ media_type: z.literal("person") }).loose(),
]);

export const SearchForMediaResponse = z.object({
  page: IntDefault0,
  results: z.array(MediaSearchResult),
  total_pages: IntDefault0,
  total_results: IntDefault0,
});

const Genre = NamedEntity;

const ProductionCompany = NamedEntity.extend({
  logo_path: ImagePath.nullable(),
  origin_country: z.string(),
});

const ProductionCountry = z.object({
  iso_3166_1: z.string(),
  name: z.string(),
});

const SpokenLanguage = z.object({
  english_name: z.string(),
  iso_639_1: z.string(),
  name: z.string(),
});

const AppendedCredits = z.object({
  credits: z.object({
    cast: z.array(
      CreditedPerson.extend({
        cast_id: IntDefault0,
        character: z.string(),
        order: IntDefault0,
      })
    ),
    crew: z.array(
      CreditedPerson.extend({
        credit_id: z.string(),
        department: z.string(),
        job: z.string(),
      })
    ),
  }),
});

export const GetMovieDetailsResponse = BaseEntity.extend({
  backdrop_path: ImagePath.nullable(),
  belongs_to_collection: z
    .string()
    .transform((name) => ({ id: 0, name }))
    .or(
      NamedEntity.extend({
        poster_path: ImagePath.nullish(),
        backdrop_path: ImagePath.nullish(),
      })
    )
    .nullable(),
  budget: IntDefault0,
  genres: z.array(Genre),
  homepage: z.string(),
  imdb_id: z.string().nullish(),
  original_language: OriginalLanguage,
  original_title: z.string(),
  overview: z.string(),
  popularity: NumberDefault0,
  poster_path: ImagePath.nullable(),
  production_companies: z.array(ProductionCompany),
  production_countries: z.array(ProductionCountry),
  release_date: OptionalDate,
  revenue: IntDefault0,
  runtime: IntDefault0,
  spoken_languages: z.array(SpokenLanguage),
  status: z.string(),
  tagline: z.string(),
  title: z.string(),
  video: BooleanDefaultTrue,
  vote_average: NumberDefault0,
  vote_count: IntDefault0,
})
  .extend(AppendedCredits.shape)
  .transform((movie) => ({ ...movie, media_type: "movie" as const }));

export const GetTvSeriesDetailsResponse = NamedEntity.extend({
  backdrop_path: ImagePath,
  created_by: z.array(Person),
  episode_run_time: z.array(z.number().int()),
  first_air_date: z.iso.date(),
  genres: z.array(Genre),
  homepage: z.string(),
  imdb_id: z.string().nullish(),
  in_production: BooleanDefaultTrue,
  languages: z.array(z.string()),
  last_air_date: z.iso.date().nullable(),
  last_episode_to_air: NamedEntity.extend({
    overview: z.string(),
    vote_average: NumberDefault0,
    vote_count: NumberDefault0,
    air_date: z.iso.date(),
    episode_number: IntDefault0,
    production_code: z.string(),
    runtime: IntDefault0,
    season_number: IntDefault0,
    show_id: IntDefault0,
    still_path: ImagePath,
  }),
  next_episode_to_air: z.string().nullable(),
  networks: z.array(
    NamedEntity.extend({
      logo_path: ImagePath,
      origin_country: z.string(),
    })
  ),
  number_of_episodes: IntDefault0,
  number_of_seasons: IntDefault0,
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_name: z.string(),
  overview: z.string(),
  popularity: NumberDefault0,
  poster_path: ImagePath.nullable(),
  production_companies: z.array(ProductionCompany),
  production_countries: z.array(ProductionCountry),
  seasons: z.array(
    NamedEntity.extend({
      air_date: z.iso.date().nullable(),
      episode_count: IntDefault0,
      overview: z.string(),
      poster_path: ImagePath.nullable(),
      season_number: IntDefault0,
      vote_average: NumberDefault0,
    })
  ),
  spoken_languages: z.array(SpokenLanguage),
  status: z.string(),
  tagline: z.string(),
  type: z.string(),
  vote_average: NumberDefault0,
  vote_count: NumberDefault0,
})
  .extend(AppendedCredits.shape)
  .transform((series) => ({ ...series, media_type: "tv" as const }));

export const GetMediaDetailsResponse = z.discriminatedUnion("media_type", [
  GetTvSeriesDetailsResponse,
  GetMovieDetailsResponse,
]);
