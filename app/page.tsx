   // เปลี่ยนเส้นทางหน้าแรกไปยังรายการงาน
   import { redirect } from "next/navigation";

   export default function Home() {
     redirect("/tasks");
   }