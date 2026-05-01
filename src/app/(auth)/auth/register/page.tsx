import RegisterForm from '@/components/auth/RegisterForm';

type Props = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};
export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = Array.isArray(params.callbackUrl)
    ? params.callbackUrl[0]
    : params.callbackUrl;

  return <RegisterForm callbackUrl={callbackUrl ?? '/projects'} />;
}
