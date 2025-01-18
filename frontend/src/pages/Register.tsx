import { RegisterForm } from '@/features/auth/components/RegisterForm';

export function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">Get started with Hostking</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
} 