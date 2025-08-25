import { search } from "@inquirer/prompts";
import { ListrInquirerPromptAdapter } from "@listr2/prompt-adapter-inquirer";
import { Listr } from "listr2";
import { getMediaDetails, searchForMedia } from "./tmdb/api";
import type { MediaDetails, MediaSearchResultItem } from "./tmdb/schema";
import { addMediaToNotion, uploadImageToNotion } from "./notion/api";

export function run(query = "") {
  return new Listr<{
    query: string;
    selected?: MediaSearchResultItem;
    details?: MediaDetails;
    posterImageId?: string;
  }>([
    {
      title: "Select a film or TV series",
      task: async (ctx, task) => {
        const prompt = task.prompt(ListrInquirerPromptAdapter);

        const result = await prompt.run(search, {
          message: "Enter a search query",
          async source(input) {
            if (!input) return [];
            const { results } = await searchForMedia(input);
            return results
              .filter((item) => item.media_type !== "person")
              .map(formatSearchResultForPrompt);
          },
        });

        ctx.selected = result as MediaSearchResultItem;
        task.title = `Selected: ${
          formatSearchResultForPrompt(ctx.selected).short
        }`;
      },
    },
    {
      title: "Get details",
      task: async (ctx) => {
        ctx.details = await getMediaDetails(ctx.selected!);
      },
    },
    {
      title: "Upload poster image to Notion",
      enabled: (ctx) => !!ctx.details?.poster_path,
      task: async (ctx) => {
        if (ctx.details?.poster_path) {
          ctx.posterImageId = await uploadImageToNotion(
            ctx.details.poster_path
          );
        }
      },
    },
    {
      title: "Add to Notion",
      task: async (ctx) => {
        await addMediaToNotion(ctx.details!, ctx.posterImageId);
      },
    },
  ]).run({ query });
}

function formatSearchResultForPrompt(item: MediaSearchResultItem) {
  switch (item.media_type) {
    case "movie": {
      const title = `🎥 ${item.title}${
        item.original_title !== item.title
          ? ` [${item.original_title} in ${item.original_language?.name}]`
          : ""
      }${item.release_date ? ` (${item.release_date.getFullYear()})` : ""}`;
      return {
        value: item,
        name: title,
        description: item.overview,
        short: title,
      };
    }

    case "tv": {
      const name = `📺 ${item.name}${
        item.original_name !== item.name ? ` [${item.original_name}}]` : ""
      }${item.first_air_date ? ` (${item.first_air_date.getFullYear()})` : ""}`;
      return { value: item, name, description: item.overview, short: name };
    }

    case "collection": {
      const title = `📁 ${item.title}${
        item.original_title !== item.title ? ` [${item.original_title}]` : ""
      }`;
      return {
        value: item,
        name: title,
        description: item.overview,
        short: title,
      };
    }
  }

  throw new Error("Unable to format search result");
}
