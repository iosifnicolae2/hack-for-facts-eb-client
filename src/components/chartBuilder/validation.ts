import { z } from "zod";

export const chartStateSchema = z.object({
    seriesId: z.number().optional().default(2),
});