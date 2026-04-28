import { useCallback, useEffect, useState } from 'react';

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

export function ProfilePage() {
  const { changeUserPassword, updateUser, user } = useAuth();
  const { showSuccess } = useFeedback();
  const [emailInput, setEmailInput] = useState(user?.email ?? '');
  const [nameInput, setNameInput] = useState(user?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setEmailInput(user?.email ?? '');
    setNameInput(user?.name ?? '');
  }, [user]);

  const handleEmailChange = useCallback((value: string) => {
    setEmailInput(value);
    setNameError('');
  }, []);

  const handleNameChange = useCallback((value: string) => {
    setNameInput(value);
    setNameError('');
  }, []);

  const handleCurrentPasswordChange = useCallback((value: string) => {
    setCurrentPassword(value);
    setPasswordError('');
  }, []);

  const handleNewPasswordChange = useCallback((value: string) => {
    setNewPassword(value);
    setPasswordError('');
  }, []);

  const handleUpdateName = useCallback(async () => {
    const trimmedEmail = emailInput.trim().toLowerCase();
    const trimmedName = nameInput.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setNameError('Please enter a valid email address.');
      return;
    }

    if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters.');
      return;
    }

    setIsProfileSubmitting(true);
    setNameError('');

    try {
      const updatedUser = await updateUser({
        email: trimmedEmail,
        name: trimmedName,
      });
      setEmailInput(updatedUser.email);
      setNameInput(updatedUser.name);
      showSuccess('Profile updated successfully.');
    } catch (error) {
      setNameError(getActionErrorMessage(error, 'Unable to update your profile right now.'));
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
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-xl bg-white px-6 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:px-10 sm:py-10">
          <p className="text-sm font-medium text-[#B31B25]">Unable to load your profile session.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-10">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Profile Settings
        </h1>
        <p className="mt-2 text-base text-gray-500 sm:text-lg">
          Manage your personal identity and security preferences.
        </p>
      </header>

      <UpdateNameForm
        email={emailInput}
        errorMessage={nameError}
        isSubmitting={isProfileSubmitting}
        name={nameInput}
        username={user.username}
        onEmailChange={handleEmailChange}
        onNameChange={handleNameChange}
        onSubmit={handleUpdateName}
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
    </main>
  );
}
