   // กำหนดโครงหน้า ฟอนต์ และข้อมูล metadata หลักของแอป
   import type { Metadata } from "next";
   import { IBM_Plex_Sans_Thai } from "next/font/google";
   import "./globals.css";

   const plex = IBM_Plex_Sans_Thai({
     variable: "--font-plex-thai",
     subsets: ["thai", "latin"],
     weight: ["400", "500", "600", "700"],
   });

   // กำหนดชื่อและคำอธิบายที่แสดงบนแท็บเบราว์เซอร์
   export const metadata: Metadata = {
     title: "Task Tracker - ระบบจัดการงานและการบ้าน",
     description: "ระบบบันทึกและติดตามงานและการบ้านของนักศึกษา",
   };

   // วางโครง HTML และฟอนต์ร่วมกันให้ทุกหน้า
   export default function RootLayout({ children }: LayoutProps<"/">) {
     return (
       <html lang="th" className={`${plex.variable} h-full antialiased`}>
         <body className="min-h-full font-sans">{children}</body>
       </html>
     );
   }