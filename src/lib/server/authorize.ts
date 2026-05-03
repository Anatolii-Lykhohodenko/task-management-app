import prisma from "@/lib/db/client";
import { compare } from "bcryptjs";

export default async function authorize(
  credentials: Partial<Record<'email' | 'password', unknown>>
) {
  if (!credentials?.email || !credentials?.password) return null;

  const user = await prisma.user.findUnique({
    where: { email: credentials.email as string },
  });

  if (!user) return null;

  const isValid = await compare(
    credentials.password as string,
    user.password
  );

  if (!isValid) return null;

  return { id: String(user.id), email: user.email, name: user.name };
}
