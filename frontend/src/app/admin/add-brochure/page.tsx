import { redirect } from "next/navigation";

export default function AddBrochure() {
  redirect("/admin/projects?new=1");
}
