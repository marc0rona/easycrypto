import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { loginSchema, type LoginFormValues } from '../../validation/authSchemas';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to log in right now. Please try again.';
}

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess } = useFeedback();
  const [submitError, setSubmitError] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      setSubmitError('');

      try {
        const authenticatedUser = await login(values);
        showSuccess(`Welcome back, ${authenticatedUser.name || authenticatedUser.username}.`);
        navigate(authenticatedUser.role === 'admin' ? '/admin' : '/dashboard');
      } catch (error) {
        setSubmitError(getErrorMessage(error));
      }
    },
    [login, navigate, showSuccess],
  );

  return (
    <div className="mx-auto w-full max-w-[40rem]">
      <div className="mb-6 text-center sm:mb-7">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0052d0_0%,#799dff_100%)] shadow-xl shadow-[#0052d0]/20 sm:h-16 sm:w-16">
          <span
            className="material-symbols-outlined text-[1.7rem] text-white sm:text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            account_balance_wallet
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#2c2f31] [font-family:Manrope,sans-serif] sm:text-4xl">
          Welcome back
        </h1>
        <p className="mx-auto max-w-[34rem] font-body leading-relaxed text-[#595c5e]">
          Secure access to your digital assets and real-time market data.
        </p>
      </div>

      <div className="rounded-xl border border-[#abadaf]/10 bg-white p-6 shadow-sm sm:p-8 md:p-9">
        <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label
              className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#595c5e]"
              htmlFor="login-email"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="login-email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                className={[
                  'w-full border-0 border-b bg-transparent px-0 py-3 text-[#2c2f31] placeholder:text-[#747779]/50 focus:ring-0 transition-all duration-300',
                  errors.email ? 'border-[#b31b25]' : 'border-[#abadaf]/30 focus:border-[#0052d0]',
                ].join(' ')}
                placeholder="name@company.com"
                type="email"
                {...register('email')}
              />
            </div>
            {errors.email ? (
              <p className="text-sm text-[#b31b25]">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#595c5e]"
                htmlFor="login-password"
              >
                Password
              </label>
              <button
                className="text-xs font-medium text-[#0052d0] transition-colors hover:text-[#0047b7]"
                type="button"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                className={[
                  'w-full border-0 border-b bg-transparent px-0 py-3 text-[#2c2f31] placeholder:text-[#747779]/50 focus:ring-0 transition-all duration-300',
                  errors.password ? 'border-[#b31b25]' : 'border-[#abadaf]/30 focus:border-[#0052d0]',
                ].join(' ')}
                placeholder="••••••••"
                type="password"
                {...register('password')}
              />
            </div>
            {errors.password ? (
              <p className="text-sm text-[#b31b25]">{errors.password.message}</p>
            ) : null}
          </div>

          {submitError ? <p className="text-sm text-[#b31b25]">{submitError}</p> : null}

          <div className="pt-2">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0052d0_0%,#799dff_100%)] px-6 py-4 font-semibold text-white shadow-lg shadow-[#0052d0]/25 transition-all duration-300 hover:shadow-[#0052d0]/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-center sm:mt-7">
        <p className="font-medium text-[#595c5e]">
          Don&apos;t have an account?
          <Link className="ml-1 text-[#0052d0] underline-offset-4 hover:underline" to="/register">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
