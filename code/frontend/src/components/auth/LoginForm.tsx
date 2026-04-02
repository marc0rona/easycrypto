import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../../validation/authSchemas';
import { AuthButton } from './AuthButton';
import { AuthInput } from './AuthInput';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to log in right now. Please try again.';
}

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
        navigate(authenticatedUser.role === 'admin' ? '/admin' : '/dashboard');
      } catch (error) {
        setSubmitError(getErrorMessage(error));
      }
    },
    [login, navigate],
  );

  return (
    <form
      className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/20"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Login to EZ-CRYPT0</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Access your dashboard and continue managing your saved crypto addresses.
        </p>
      </div>

      <div className="space-y-5">
        <AuthInput
          autoComplete="email"
          error={errors.email?.message}
          id="login-email"
          label="Email"
          placeholder="you@example.com"
          type="email"
          {...register('email')}
        />

        <AuthInput
          autoComplete="current-password"
          error={errors.password?.message}
          id="login-password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          {...register('password')}
        />

        <AuthButton disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Login'}</AuthButton>

        {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{' '}
        <Link className="font-medium text-cyan-300 hover:text-cyan-200" to="/register">
          Register
        </Link>
      </p>
    </form>
  );
}
