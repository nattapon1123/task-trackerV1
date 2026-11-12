   // ตรวจสอบสถานะผู้ใช้และแสดงหน้าเข้าสู่ระบบ
   import { redirect } from "next/navigation";

   import { auth } from "@/app/auth";
   import LoginForm from "./login-form";

   type LoginPageProps = {
     searchParams: Promise<{
       registered?: string;
       error?: string;
     }>;
   };

   // ส่งผู้ใช้ที่ Login แล้วไปหน้ารายการงาน หรือแสดงฟอร์มเข้าสู่ระบบ
   export default async function LoginPage({ searchParams }: LoginPageProps) {
     const session = await auth();

     // Login อยู่แล้วไม่ต้องเห็นหน้านี้อีก
     if (session?.user) {
       redirect("/tasks");
     }

     const { registered, error } = await searchParams;

     return <LoginForm registered={registered === "1"} urlError={error ?? ""} />;
   }