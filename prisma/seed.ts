import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const customers = [
  // 国际食客
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
  // 中文食客
  {
    name: "陈大明",
    region: "上海",
    personality: "对本帮菜极其挑剔，喜欢浓油赤酱，看不起太清淡的东西",
    dietaryRestrictions: JSON.stringify(["不吃香菜"]),
  },
  {
    name: "李翠花",
    region: "四川",
    personality: "无辣不欢，说话直接，做菜不够辣就会现场加辣椒",
    dietaryRestrictions: JSON.stringify([]),
  },
  {
    name: "王建国",
    region: "北京",
    personality: "热爱面食，见到不正宗的炸酱面会当场翻脸，喜欢用饮食讲道理",
    dietaryRestrictions: JSON.stringify(["不吃羊肉"]),
  },
  {
    name: "张小慧",
    region: "广东",
    personality: "喜欢清淡原味，非常在意食材新鲜程度，用粤语评价食物",
    dietaryRestrictions: JSON.stringify(["不吃牛肉"]),
  },
  {
    name: "赵铁柱",
    region: "东北",
    personality: "豪爽粗犷，喜欢大口吃肉，觉得菜量少就是不尊重人",
    dietaryRestrictions: JSON.stringify([]),
  },
  {
    name: "吴雅琴",
    region: "苏州",
    personality: "讲究精致，偏爱甜味，喜欢把食物比喻成诗句",
    dietaryRestrictions: JSON.stringify(["素食"]),
  },
  // 更多国际食客
  {
    name: "Mei Lin",
    region: "Taiwan",
    personality: "nostalgic and detail-oriented, always compares food to her grandmother's cooking",
    dietaryRestrictions: JSON.stringify([]),
  },
  {
    name: "Diego Ferreira",
    region: "Brazil",
    personality: "sociable and festive, believes every meal should be a party",
    dietaryRestrictions: JSON.stringify([]),
  },
  {
    name: "Nadia Kowalski",
    region: "Poland",
    personality: "practical and hearty, distrusts anything too exotic",
    dietaryRestrictions: JSON.stringify([]),
  },
  {
    name: "Tariq Al-Masri",
    region: "Lebanon",
    personality: "hospitality-obsessed, very knowledgeable about Middle Eastern cuisine",
    dietaryRestrictions: JSON.stringify(["halal only", "no pork"]),
  },
];

const dishes = [
  // 中式
  { name: "北京炸酱面", cuisine: "Chinese" },
  { name: "四川麻婆豆腐", cuisine: "Chinese" },
  { name: "广东白切鸡", cuisine: "Chinese" },
  { name: "上海红烧肉", cuisine: "Chinese" },
  { name: "东北乱炖", cuisine: "Chinese" },
  { name: "扬州炒饭", cuisine: "Chinese" },
  { name: "夫妻肺片", cuisine: "Chinese" },
  // 日式
  { name: "日式拉面", cuisine: "Japanese" },
  { name: "寿司拼盘", cuisine: "Japanese" },
  { name: "日式天妇罗", cuisine: "Japanese" },
  // 韩式
  { name: "韩式石锅拌饭", cuisine: "Korean" },
  { name: "韩式炸鸡", cuisine: "Korean" },
  // 东南亚
  { name: "泰式绿咖喱", cuisine: "Thai" },
  { name: "越南河粉", cuisine: "Vietnamese" },
  { name: "新加坡叻沙", cuisine: "Singaporean" },
  // 南亚
  { name: "印度咖喱鸡", cuisine: "Indian" },
  { name: "印度黄油鸡", cuisine: "Indian" },
  // 中东/非洲
  { name: "摩洛哥塔吉锅", cuisine: "Moroccan" },
  { name: "埃及豆泥", cuisine: "Egyptian" },
  { name: "尼日利亚炖菜", cuisine: "Nigerian" },
  { name: "土耳其烤肉串", cuisine: "Turkish" },
  { name: "黎巴嫩沙瓦尔玛", cuisine: "Lebanese" },
  // 欧洲
  { name: "法式焦糖布丁", cuisine: "French" },
  { name: "法式马赛鱼汤", cuisine: "French" },
  { name: "意大利肉酱面", cuisine: "Italian" },
  { name: "意大利烩饭", cuisine: "Italian" },
  { name: "西班牙海鲜饭", cuisine: "Spanish" },
  { name: "希腊沙拉", cuisine: "Greek" },
  { name: "俄式罗宋汤", cuisine: "Russian" },
  { name: "瑞典肉丸", cuisine: "Swedish" },
  // 美洲
  { name: "墨西哥玉米卷", cuisine: "Mexican" },
  { name: "墨西哥玉米片配莎莎酱", cuisine: "Mexican" },
  { name: "巴西烤肉", cuisine: "Brazilian" },
  // 甜品/街食
  { name: "比利时华夫饼", cuisine: "Belgian" },
  { name: "土耳其冰淇淋", cuisine: "Turkish" },
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
