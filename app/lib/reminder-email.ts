type ReminderEmailInput = {
  name: string;
  taskTitle: string;
  subjectName: string;
  dueDate: Date; // เก็บเป็นเที่ยงคืน UTC ของวันนั้น
  daysBefore: number; // 3 หรือ 0
};

// ป้องกันอักขระพิเศษทำให้ HTML เพี้ยน
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildReminderEmail(input: ReminderEmailInput) {
  // ใช้ timeZone UTC เพื่อให้วันที่ตรงกับที่หน้าเว็บแสดง
  const dueText = input.dueDate.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const headline =
    input.daysBefore === 0
      ? "งานนี้ถึงกำหนดส่งวันนี้"
      : `อีก ${input.daysBefore} วันถึงกำหนดส่ง`;

  const subject =
    input.daysBefore === 0
      ? `[Task Tracker] วันนี้ถึงกำหนดส่ง: ${input.taskTitle}`
      : `[Task Tracker] เหลืออีก ${input.daysBefore} วัน: ${input.taskTitle}`;

  const text = [
    `สวัสดี ${input.name}`,
    "",
    headline,
    `งาน: ${input.taskTitle}`,
    `วิชา: ${input.subjectName}`,
    `กำหนดส่ง: ${dueText}`,
    "",
    "ดูรายการงานได้ที่เว็บ Task Tracker",
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <p>สวัสดี ${escapeHtml(input.name)}</p>
      <p><strong>${headline}</strong></p>
      <ul>
        <li>งาน: ${escapeHtml(input.taskTitle)}</li>
        <li>วิชา: ${escapeHtml(input.subjectName)}</li>
        <li>กำหนดส่ง: ${dueText}</li>
      </ul>
      <p>ดูรายการงานได้ที่เว็บ Task Tracker</p>
    </div>
  `;

  return { subject, text, html };
}