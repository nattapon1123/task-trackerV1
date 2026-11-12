   // สร้าง Prisma Client ที่เชื่อมต่อฐานข้อมูล SQLite
   import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
   import { PrismaClient } from "@/app/generated/prisma/client";

   const adapter = new PrismaBetterSqlite3({
     url: process.env.DATABASE_URL!,
   });

   // สร้าง Prisma Client พร้อม SQLite adapter ให้ส่วนต่าง ๆ ของแอปเรียกใช้
   const prisma = new PrismaClient({
     adapter,
   });

   export default prisma;