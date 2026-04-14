import React from 'react';
import PracticeHub from '@/components/practice/PracticeHub';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function PracticePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <PracticeHub />;
}
