import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { registerSchema, type RegisterFormValues } from '../../validation/authSchemas';
import { AuthButton } from './AuthButton';
import { AuthInput } from './AuthInput';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to create your account right now. Please try again.';
}

export function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerAccount } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    async (values: RegisterFormValues) => {
      setSubmitError('');

      try {
        await registerAccount(values);
        navigate('/dashboard');
      } catch (error) {
        setSubmitError(getErrorMessage(error));
      }
    },
    [navigate, registerAccount],
  );

  return (
    <form
      className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/20"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Create your account</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Set up your EZ-CRYPT0 workspace and start organizing addresses in one place.
        </p>
      </div>

      <div className="space-y-5">
        <AuthInput
          autoComplete="username"
          error={errors.username?.message}
          id="register-username"
          label="Username"
          placeholder="Choose a username"
          type="text"
          {...register('username')}
        />

        <AuthInput
          autoComplete="email"
          error={errors.email?.message}
          id="register-email"
          label="Email"
          placeholder="you@example.com"
          type="email"
          {...register('email')}
        />

        <AuthInput
          autoComplete="new-password"
          error={errors.password?.message}
          helperText="Minimum 6 characters."
          id="register-password"
          label="Password"
          placeholder="Create a password"
          type="password"
          {...register('password')}
        />

        <AuthButton disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </AuthButton>

        {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link className="font-medium text-cyan-300 hover:text-cyan-200" to="/login">
          Login
        </Link>
      </p>
    </form>
  );
}
