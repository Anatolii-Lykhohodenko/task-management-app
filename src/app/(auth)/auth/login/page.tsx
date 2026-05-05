import LoginForm from "@/components/auth/LoginForm";
import { rootRoute } from "@/lib/routes";

type Props = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default async function LoginPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const callbackUrl = Array.isArray(params.callbackUrl)
    ? params.callbackUrl[0]
    : params.callbackUrl;

  return <LoginForm callbackUrl={callbackUrl ?? rootRoute} />;
}