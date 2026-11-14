# คู่มือการ Deploy: Task Tracker

เอกสารนี้สรุปสิ่งที่ต้องทำก่อนและหลังนำแอปขึ้นเซิร์ฟเวอร์จริง

## 1. ตัวแปรสภาพแวดล้อมที่ต้องตั้งบนเซิร์ฟเวอร์

ตั้งค่าเหล่านี้ในหน้า Environment Variables ของแพลตฟอร์มที่ใช้ ห้ามใส่ค่าจริงลงในไฟล์ที่ commit

| ตัวแปร | ความหมาย | วิธีได้มา |
|---|---|---|
| `DATABASE_URL` | การเชื่อมต่อฐานข้อมูล Postgres | จากผู้ให้บริการฐานข้อมูล (ดูหัวข้อ 2) |
| `AUTH_SECRET` | คีย์เข้ารหัส session ของ Auth.js | `npx auth secret` หรือ `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Client ID จาก Google | Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | Client Secret จาก Google | Google Cloud Console |
| `GMAIL_USER` | อีเมล Gmail ที่ใช้ส่งแจ้งเตือน | อีเมลของคุณเอง |
| `GMAIL_APP_PASSWORD` | App Password 16 ตัวของ Gmail | Google Account > Security > App passwords |
| `CRON_SECRET` | รหัสลับสำหรับเรียก route แจ้งเตือน | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

ข้อควรระวัง: `AUTH_SECRET` และ `CRON_SECRET` ต้องเป็นค่าใหม่บนเซิร์ฟเวอร์ ห้ามใช้ค่าเดียวกับเครื่องพัฒนา

## 2. ย้ายฐานข้อมูลจาก SQLite ไป Postgres

SQLite เป็นไฟล์บนเครื่อง ไม่เหมาะกับแพลตฟอร์มที่ระบบไฟล์ไม่คงอยู่ จึงต้องเปลี่ยนเป็น Postgres ก่อน deploy

1. สร้างฐานข้อมูล Postgres จากผู้ให้บริการที่เลือก แล้วคัดลอก connection string
2. ใน `prisma/schema.prisma` เปลี่ยน `provider = "sqlite"` เป็น `provider = "postgresql"`
3. ติดตั้ง adapter ของ Postgres และแก้ `app/lib/prisma.ts` ให้ใช้ `PrismaPg` แทน `PrismaBetterSqlite3`
4. สร้าง migration ใหม่สำหรับ Postgres ในเครื่องก่อน แล้วค่อย deploy
5. ตั้ง `DATABASE_URL` บนเซิร์ฟเวอร์เป็น connection string ของ Postgres

ข้อควรระวัง: ข้อมูลใน SQLite ไม่ถูกย้ายอัตโนมัติ ถ้าต้องการข้อมูลเดิม ต้องส่งออกและนำเข้าเอง

## 3. รัน migration บนเซิร์ฟเวอร์

ใช้คำสั่งนี้เท่านั้นบนเซิร์ฟเวอร์

```bash
npx prisma migrate deploy
npx prisma generate
```

ห้ามใช้ `prisma migrate dev` บนเซิร์ฟเวอร์ เพราะคำสั่งนั้นออกแบบไว้สำหรับการพัฒนาและอาจสร้างหรือรีเซ็ตข้อมูล

## 4. ตั้งค่า Google OAuth

1. ใน Google Cloud Console เพิ่ม Authorized redirect URI เป็นโดเมนจริง เช่น
   `https://your-domain.com/api/auth/callback/google`
2. ถ้าแอปยังอยู่ในโหมด Testing ให้เพิ่มอีเมลผู้ทดสอบใน OAuth consent screen
3. ตั้ง `AUTH_URL` เป็นโดเมนจริง ถ้าแพลตฟอร์มไม่ตั้งให้อัตโนมัติ

## 5. ตั้ง cron สำหรับการแจ้งเตือน

ระบบแจ้งเตือนไม่ทำงานเองโดยอัตโนมัติ ต้องให้บริการภายนอกเรียก route ทุกชั่วโมง

- เส้นทาง: `GET /api/cron/reminders`
- Header: `Authorization: Bearer <CRON_SECRET>`
- ความถี่: ทุกชั่วโมง

ตั้งความถี่เป็นทุกชั่วโมงเพื่อให้รอบเที่ยงคืนไทยถูกส่งภายในชั่วโมงแรกหลังเวลานั้น การคำนวณเวลาไทยอยู่ในโค้ดแล้ว จึงไม่ต้องตั้ง cron ให้ตรงเวลาไทยเอง

ทดสอบหลังตั้งค่า โดยเรียกด้วยรหัสจริงหนึ่งครั้ง ต้องได้ JSON ที่มี `sent` และ `failed`

## 6. ตรวจหลัง deploy

- เปิดหน้าสมัครและเข้าสู่ระบบด้วยอีเมลได้
- เข้าสู่ระบบด้วย Google ได้
- เพิ่มวิชาและงานได้
- หน้าตั้งค่าเปิดปิดการแจ้งเตือนได้
- เรียก route cron ด้วยรหัสที่ถูกต้องแล้วได้ผลลัพธ์ ส่วนรหัสผิดต้องได้ `unauthorized`
- ไม่มี `.env` หรือ `dev.db` ใน repository

## 7. หมายเหตุเรื่องเวลา

- ฐานข้อมูลเก็บวันครบกำหนดเป็นเที่ยงคืน UTC ของวันนั้น
- โค้ดคำนวณเที่ยงคืนตามเวลาไทย (UTC+7) ใน `app/lib/reminders.ts`
- cron รันทุกชั่วโมงตามเวลา UTC ไม่ต้องปรับตามเขตเวลา