import "dotenv/config";
import { sendMail } from "../app/lib/mailer";
import { buildReminderEmail } from "../app/lib/reminder-email";

async function main() {
  const to = process.env.GMAIL_USER;
  if (!to) throw new Error("ไม่พบ GMAIL_USER ในไฟล์ .env");

  const email = buildReminderEmail({
    name: "ทดสอบ",
    taskTitle: "ส่งรายงานบทที่ 1",
    subjectName: "Web Programming",
    dueDate: new Date("2026-11-10T00:00:00.000Z"),
    daysBefore: 3,
  });

  const info = await sendMail({ to, ...email });
  console.log("ส่งสำเร็จ messageId:", info.messageId);
}

main().catch((error) => {
  console.error("ส่งไม่สำเร็จ:", error);
  process.exit(1);
});