import LoginForm from "@/components/auth/LoginForm";

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

  return <LoginForm callbackUrl={callbackUrl ?? '/projects'} />;
}