import { search } from "@inquirer/prompts";
import { ListrInquirerPromptAdapter } from "@listr2/prompt-adapter-inquirer";
import { Listr } from "listr2";
import { getMediaDetails, searchForMedia } from "./tmdb/api";
import type { MediaDetails, MediaSearchResultItem } from "./tmdb/schema";
import { addMediaToNotion } from "./notion/api";

export function run(query = "") {
  return new Listr<{
    query: string;
    selected?: MediaSearchResultItem;
    details?: MediaDetails;
  }>([
    {
      title: "Find a film/series",
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
        task.title = `Selected: ${formatSearchResultForPrompt(ctx.selected).short}`;
      },
    },
    {
      title: "Get details",
      task: async (ctx) => {
        ctx.details = await getMediaDetails(ctx.selected!);
      },
    },
    {
      title: "Add to Notion",
      task: async (ctx) => {
        await addMediaToNotion(ctx.details!);
      },
    },
  ]).run({ query });
}

function formatSearchResultForPrompt(item: MediaSearchResultItem) {
  switch (item.media_type) {
    case "movie":
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
    case "tv":
      const name = `📺 ${item.name}${
        item.original_name !== item.name
          ? ` [${item.original_name} in ${item.original_language?.name}]`
          : ""
      }${item.first_air_date ? ` (${item.first_air_date.getFullYear()})` : ""}`;
      return { value: item, name, description: item.overview, short: name };
  }
  throw new Error("Unable to format search result");
}
