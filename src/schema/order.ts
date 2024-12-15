import { z } from "zod";

const itemSchema = z.object({
  productId: z.number(),
  colorId: z.number(),
  quantity: z.number(),
});

export const orderSchema = z.object({
  items: z.array(itemSchema),
  userId: z.number(),
  address: z.string(),
  postalCode: z.string(),
  country: z.string(),
  city: z.string(),
});
