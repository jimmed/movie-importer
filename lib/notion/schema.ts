import { z } from "zod";

export const UpdatePageResponse = z.object({
  url: z.url(),
  request_id: z.uuid(),
});
