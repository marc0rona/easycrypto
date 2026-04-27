import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { registerSchema, type RegisterFormValues } from '../../validation/authSchemas';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to create your account right now. Please try again.';
}

export function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerAccount } = useAuth();
  const { showSuccess } = useFeedback();
  const [submitError, setSubmitError] = useState('');
  const [acceptsTerms, setAcceptsTerms] = useState(false);
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

      if (!acceptsTerms) {
        setSubmitError('Please accept the Terms of Service and Privacy Policy.');
        return;
      }

      try {
        await registerAccount(values);
        showSuccess('Account created successfully. Welcome to EZ-CRYPT0.');
        navigate('/dashboard');
      } catch (error) {
        setSubmitError(getErrorMessage(error));
      }
    },
    [acceptsTerms, navigate, registerAccount, showSuccess],
  );

  return (
    <div className="grid items-center gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(400px,0.8fr)] xl:gap-8">
      <div className="hidden flex-col space-y-4 pr-4 xl:flex xl:pr-8">
        <div className="max-w-[40rem] space-y-3">
          <h1 className="text-[clamp(2.3rem,3.8vw,3.7rem)] leading-[1.06] font-extrabold tracking-tight text-[#2c2f31] [font-family:Manrope,sans-serif]">
            Secure your digital
            <br />
            wealth on the <span className="text-[#0052d0]">Luminous Canvas.</span>
          </h1>
          <p className="max-w-[28rem] text-base leading-relaxed text-[#595c5e]">
            Join the next generation of high-end asset management. Sophisticated, decentralized, and built for clarity.
          </p>
        </div>

        <div className="max-w-[42rem] space-y-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[#799dff]/20 p-3">
              <span className="material-symbols-outlined text-[#0052d0]">security</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2c2f31]">Institutional Grade Security</h3>
              <p className="text-sm text-[#595c5e]">
                Multi-layer encryption and biometric verification protect every transaction.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[#799dff]/20 p-3">
              <span className="material-symbols-outlined text-[#0052d0]">auto_graph</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2c2f31]">Smart Insights</h3>
              <p className="text-sm text-[#595c5e]">
                Real-time data visualization optimized for the sophisticated investor.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[30rem]">
        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-7 lg:p-8">
          <div className="mb-6 text-center xl:text-left">
            <h2 className="mb-2 text-3xl font-bold text-[#2c2f31] [font-family:Manrope,sans-serif]">
              Create your account
            </h2>
            <p className="text-[#595c5e]">Start your journey with premium crypto tools.</p>
          </div>

          <form className="space-y-[1.125rem]" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="group">
              <label
                className="mb-1 ml-1 block text-xs font-semibold uppercase tracking-[0.18em] text-[#595c5e]"
                htmlFor="register-name"
              >
                Full Name
              </label>
              <input
                id="register-name"
                autoComplete="username"
                aria-invalid={Boolean(errors.username)}
                className={[
                  'w-full border-0 border-b bg-transparent px-1 py-3 text-[#2c2f31] placeholder:text-[#abadaf]/60 focus:ring-0 transition-all',
                  errors.username ? 'border-[#b31b25]' : 'border-[#abadaf]/30 focus:border-[#0052d0]',
                ].join(' ')}
                placeholder="Alex Rivera"
                type="text"
                {...register('username')}
              />
              {errors.username ? (
                <p className="mt-2 text-sm text-[#b31b25]">{errors.username.message}</p>
              ) : null}
            </div>

            <div className="group">
              <label
                className="mb-1 ml-1 block text-xs font-semibold uppercase tracking-[0.18em] text-[#595c5e]"
                htmlFor="register-email"
              >
                Email Address
              </label>
              <input
                id="register-email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                className={[
                  'w-full border-0 border-b bg-transparent px-1 py-3 text-[#2c2f31] placeholder:text-[#abadaf]/60 focus:ring-0 transition-all',
                  errors.email ? 'border-[#b31b25]' : 'border-[#abadaf]/30 focus:border-[#0052d0]',
                ].join(' ')}
                placeholder="alex@example.com"
                type="email"
                {...register('email')}
              />
              {errors.email ? (
                <p className="mt-2 text-sm text-[#b31b25]">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="group">
              <label
                className="mb-1 ml-1 block text-xs font-semibold uppercase tracking-[0.18em] text-[#595c5e]"
                htmlFor="register-password"
              >
                Password
              </label>
              <input
                id="register-password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                className={[
                  'w-full border-0 border-b bg-transparent px-1 py-3 text-[#2c2f31] placeholder:text-[#abadaf]/60 focus:ring-0 transition-all',
                  errors.password ? 'border-[#b31b25]' : 'border-[#abadaf]/30 focus:border-[#0052d0]',
                ].join(' ')}
                placeholder="••••••••"
                type="password"
                {...register('password')}
              />
              {errors.password ? (
                <p className="mt-2 text-sm text-[#b31b25]">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="flex items-start gap-3 py-1">
              <div className="flex h-5 items-center">
                <input
                  checked={acceptsTerms}
                  className="h-4 w-4 rounded border-[#abadaf]/30 text-[#0052d0] focus:ring-[#0052d0]/20"
                  id="terms"
                  type="checkbox"
                  onChange={(event) => {
                    setAcceptsTerms(event.target.checked);
                    if (submitError === 'Please accept the Terms of Service and Privacy Policy.') {
                      setSubmitError('');
                    }
                  }}
                />
              </div>
              <label className="text-sm leading-tight text-[#595c5e]" htmlFor="terms">
                I agree to the{' '}
                <a className="text-[#0052d0] transition-all hover:underline" href="#">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a className="text-[#0052d0] transition-all hover:underline" href="#">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {submitError ? <p className="text-sm text-[#b31b25]">{submitError}</p> : null}

            <button
              className="w-full rounded-full bg-[linear-gradient(135deg,#0052d0_0%,#799dff_100%)] py-3.5 text-lg font-semibold text-[#f1f2ff] shadow-lg shadow-[#0052d0]/20 transition-transform duration-200 hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="pt-4 text-center">
              <p className="text-sm text-[#595c5e]">
                Already have an account?{' '}
                <Link className="font-semibold text-[#0052d0] transition-all hover:underline" to="/login">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
