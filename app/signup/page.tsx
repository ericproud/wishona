import SignupForm from './signup-form'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SignupForm redirectTo={redirectTo ?? ''} />
    </div>
  )
}
