import LoginForm from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <LoginForm redirectTo={redirectTo ?? ''} />
    </div>
  )
}
