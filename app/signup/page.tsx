import SignupForm from './signup-form'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <span className="text-lg font-semibold text-foreground">Gift Simple</span>
      </div>
      <SignupForm redirectTo={redirectTo ?? ''} />
    </div>
  )
}
