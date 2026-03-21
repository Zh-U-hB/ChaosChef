import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const customers = [
  {
    name: "Kenji Tanaka",
    region: "Japan",
    personality: "reserved and precise, expects perfection in presentation",
    dietaryRestrictions: JSON.stringify(["no pork"]),
  },
  {
    name: "Fatima Al-Rashid",
    region: "Morocco",
    personality: "warm and expressive, loves bold spices and communal eating",
    dietaryRestrictions: JSON.stringify(["halal only", "no alcohol"]),
  },
  {
    name: "Carlos Mendoza",
    region: "Mexico",
    personality: "cheerful and adventurous, willing to try anything once",
    dietaryRestrictions: JSON.stringify([]),
  },
  {
    name: "Priya Sharma",
    region: "India",
    personality: "opinionated about authenticity, generous with praise when satisfied",
    dietaryRestrictions: JSON.stringify(["vegetarian", "no beef"]),
  },
  {
    name: "Lars Eriksson",
    region: "Sweden",
    personality: "stoic and minimal, values simplicity and clean flavors",
    dietaryRestrictions: JSON.stringify([]),
  },
  {
    name: "Amara Okafor",
    region: "Nigeria",
    personality: "loud and enthusiastic, enjoys rich sauces and hearty portions",
    dietaryRestrictions: JSON.stringify([]),
  },
  {
    name: "Sophie Beaumont",
    region: "France",
    personality: "refined and critical, deeply attached to classical technique",
    dietaryRestrictions: JSON.stringify([]),
  },
  {
    name: "Wei Chen",
    region: "China",
    personality: "practical and direct, judges by balance of flavors",
    dietaryRestrictions: JSON.stringify(["no dairy"]),
  },
  {
    name: "Isabella Romano",
    region: "Italy",
    personality: "passionate and protective of tradition, reacts strongly to bad pasta",
    dietaryRestrictions: JSON.stringify([]),
  },
  {
    name: "Ahmed Hassan",
    region: "Egypt",
    personality: "philosophical and patient, appreciates effort over result",
    dietaryRestrictions: JSON.stringify(["halal only"]),
  },
  {
    name: "Yuki Park",
    region: "South Korea",
    personality: "trendy and food-curious, loves fusion if done intentionally",
    dietaryRestrictions: JSON.stringify([]),
  },
  {
    name: "Elena Volkov",
    region: "Russia",
    personality: "blunt and no-nonsense, respects heartiness over elegance",
    dietaryRestrictions: JSON.stringify([]),
  },
];

const dishes = [
  { name: "北京炸酱面", cuisine: "Chinese" },
  { name: "摩洛哥塔吉锅", cuisine: "Moroccan" },
  { name: "法式焦糖布丁", cuisine: "French" },
  { name: "日式拉面", cuisine: "Japanese" },
  { name: "印度咖喱鸡", cuisine: "Indian" },
  { name: "墨西哥玉米卷", cuisine: "Mexican" },
  { name: "意大利肉酱面", cuisine: "Italian" },
  { name: "泰式绿咖喱", cuisine: "Thai" },
  { name: "西班牙海鲜饭", cuisine: "Spanish" },
  { name: "韩式石锅拌饭", cuisine: "Korean" },
  { name: "希腊沙拉", cuisine: "Greek" },
  { name: "俄式罗宋汤", cuisine: "Russian" },
  { name: "埃及豆泥", cuisine: "Egyptian" },
  { name: "巴西烤肉", cuisine: "Brazilian" },
  { name: "越南河粉", cuisine: "Vietnamese" },
  { name: "土耳其烤肉串", cuisine: "Turkish" },
  { name: "尼日利亚炖菜", cuisine: "Nigerian" },
  { name: "瑞典肉丸", cuisine: "Swedish" },
];

async function main() {
  await prisma.customer.deleteMany();
  await prisma.dish.deleteMany();

  await prisma.customer.createMany({ data: customers });
  await prisma.dish.createMany({ data: dishes });

  console.log(`Seeded ${customers.length} customers and ${dishes.length} dishes.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
