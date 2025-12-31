import { redirect } from "next/navigation";
import type { Locale } from "@/config/site";

interface BuildYourOwnSetPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BuildYourOwnSetPage({
  params,
}: BuildYourOwnSetPageProps) {
  const { locale } = await params;
  redirect(`/${locale as Locale}/shop`);
}
