import nodemailer from "nodemailer";

// ตั้งค่าการเชื่อมต่อ Gmail ด้วย App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

type MailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

// ส่งอีเมลโดยให้ชื่อผู้ส่งเป็น "Task Tracker" (อีเมลจริงยังเป็น Gmail ของเรา)
export function sendMail(input: MailInput) {
  return transporter.sendMail({
    from: `"Task Tracker" <${process.env.GMAIL_USER}>`,
    ...input,
  });
}