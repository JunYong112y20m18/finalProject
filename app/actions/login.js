"use server";

import { signIn } from "@/auth";

export async function loginAction(formData) {
  const provider = formData.get("provider");
  await signIn(provider);
}
