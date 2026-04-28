import { useCallback, useEffect, useMemo, useState } from 'react';

import { ChangePasswordForm } from '../../components/dashboard/ChangePasswordForm';
import { UpdateNameForm } from '../../components/dashboard/UpdateNameForm';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';

function getActionErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function getInitials(name: string, username: string, email: string) {
  const baseValue = name.trim() || username.trim() || email.trim();

  return baseValue
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function AdminProfilePage() {
  const { changeUserPassword, updateUser, user } = useAuth();
  const { showSuccess } = useFeedback();
  const [emailInput, setEmailInput] = useState(user?.email ?? '');
  const [nameInput, setNameInput] = useState(user?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  useEffect(() => {
    setEmailInput(user?.email ?? '');
    setNameInput(user?.name ?? '');
  }, [user]);

  const displayName = useMemo(() => {
    if (user?.name?.trim()) {
      return user.name.trim();
    }

    if (user?.username?.trim()) {
      return user.username.trim();
    }

    return 'Admin';
  }, [user]);

  const initials = useMemo(() => {
    if (!user) {
      return 'AD';
    }

    return getInitials(user.name, user.username, user.email) || 'AD';
  }, [user]);

  const handleEmailChange = useCallback((value: string) => {
    setEmailInput(value);
    setProfileError('');
  }, []);

  const handleNameChange = useCallback((value: string) => {
    setNameInput(value);
    setProfileError('');
  }, []);

  const handleCurrentPasswordChange = useCallback((value: string) => {
    setCurrentPassword(value);
    setPasswordError('');
  }, []);

  const handleNewPasswordChange = useCallback((value: string) => {
    setNewPassword(value);
    setPasswordError('');
  }, []);

  const handleUpdateProfile = useCallback(async () => {
    const trimmedEmail = emailInput.trim().toLowerCase();
    const trimmedName = nameInput.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setProfileError('Please enter a valid email address.');
      return;
    }

    if (trimmedName.length < 2) {
      setProfileError('Name must be at least 2 characters.');
      return;
    }

    setIsProfileSubmitting(true);
    setProfileError('');

    try {
      const updatedUser = await updateUser({
        email: trimmedEmail,
        name: trimmedName,
      });

      setEmailInput(updatedUser.email);
      setNameInput(updatedUser.name);
      showSuccess('Admin profile updated successfully.');
    } catch (error) {
      setProfileError(getActionErrorMessage(error, 'Unable to update your admin profile right now.'));
    } finally {
      setIsProfileSubmitting(false);
    }
  }, [emailInput, nameInput, showSuccess, updateUser]);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      setPasswordError('Both password fields are required.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setIsPasswordSubmitting(true);
    setPasswordError('');

    try {
      await changeUserPassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      setCurrentPassword('');
      setNewPassword('');
      showSuccess('Password updated successfully.');
    } catch (error) {
      setPasswordError(getActionErrorMessage(error, 'Unable to change your password right now.'));
    } finally {
      setIsPasswordSubmitting(false);
    }
  }, [changeUserPassword, currentPassword, newPassword, showSuccess]);

  if (!user) {
    return (
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="rounded-[28px] bg-white px-5 py-8 shadow-sm sm:px-8 sm:py-10">
          <p className="text-sm font-semibold text-[#b31b25]">Unable to load your admin profile session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-6xl">
      <header className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#0052d0]">
            Admin account
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2c2f31] [font-family:Manrope,sans-serif] sm:text-4xl">
            My Profile
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-[#595c5e]">
            Keep your admin identity, email, and security settings accurate across the control workspace.
          </p>
        </div>
      </header>

      <section className="mb-8 rounded-[28px] bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#0052d0] to-[#7a9dff] text-2xl font-black text-white shadow-lg shadow-[#0052d0]/15">
              {initials}
            </div>

            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[#2c2f31] [font-family:Manrope,sans-serif] sm:text-2xl">
                {displayName}
              </h2>
              <p className="mt-1 text-sm text-[#595c5e]">{user.email}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#0052d0]">
                  Administrator
                </span>
                <span className="inline-flex items-center rounded-full bg-[#f5f7f9] px-3 py-1 text-xs font-semibold text-[#595c5e]">
                  @{user.username}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f5f7f9] px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a7d80]">Access level</p>
              <p className="mt-2 text-lg font-bold text-[#2c2f31]">Full admin</p>
            </div>
            <div className="rounded-2xl bg-[#f5f7f9] px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a7d80]">Workspace role</p>
              <p className="mt-2 text-lg font-bold text-[#2c2f31]">System control</p>
            </div>
          </div>
        </div>
      </section>

      <UpdateNameForm
        email={emailInput}
        errorMessage={profileError}
        isSubmitting={isProfileSubmitting}
        name={nameInput}
        username={user.username}
        onEmailChange={handleEmailChange}
        onNameChange={handleNameChange}
        onSubmit={handleUpdateProfile}
      />

      <ChangePasswordForm
        currentPassword={currentPassword}
        errorMessage={passwordError}
        isSubmitting={isPasswordSubmitting}
        newPassword={newPassword}
        onCurrentPasswordChange={handleCurrentPasswordChange}
        onNewPasswordChange={handleNewPasswordChange}
        onSubmit={handleChangePassword}
      />
    </div>
  );
}
