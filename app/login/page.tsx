import LoginForm from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <span className="text-lg font-semibold text-foreground">Wishona</span>
      </div>
      <LoginForm redirectTo={redirectTo ?? ''} />
    </div>
  )
}
