import { prisma } from "./client";
import type { CustomerData, DishData } from "@/types/game";

export async function getRandomCustomer(): Promise<CustomerData> {
  const count = await prisma.customer.count();
  const skip = Math.floor(Math.random() * count);
  const customer = await prisma.customer.findFirst({ skip });

  if (!customer) throw new Error("No customers in database");

  return {
    id: customer.id,
    name: customer.name,
    region: customer.region,
    personality: customer.personality,
    dietaryRestrictions: JSON.parse(customer.dietaryRestrictions) as string[],
  };
}

export async function getRandomDish(): Promise<DishData> {
  const count = await prisma.dish.count();
  const skip = Math.floor(Math.random() * count);
  const dish = await prisma.dish.findFirst({ skip });

  if (!dish) throw new Error("No dishes in database");

  return { id: dish.id, name: dish.name, cuisine: dish.cuisine };
}
