import { useCallback, useState } from 'react';

import { ChangePasswordForm } from '../../components/dashboard/ChangePasswordForm';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { ProfileCard } from '../../components/dashboard/ProfileCard';
import { StatCard } from '../../components/dashboard/StatCard';
import { UpdateNameForm } from '../../components/dashboard/UpdateNameForm';

interface MockUser {
  email: string;
  lastActivity: string;
  totalAddresses: number;
  username: string;
}

const initialUser: MockUser = {
  email: 'driss@ez-crypt0.app',
  lastActivity: 'Today at 11:42 AM',
  totalAddresses: 28,
  username: 'driss_workspace',
};

export function ProfilePage() {
  const [user, setUser] = useState<MockUser>(initialUser);
  const [usernameInput, setUsernameInput] = useState(initialUser.username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [nameMessage, setNameMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const handleUsernameChange = useCallback((value: string) => {
    setUsernameInput(value);
    setNameMessage('');
  }, []);

  const handleCurrentPasswordChange = useCallback((value: string) => {
    setCurrentPassword(value);
    setPasswordError('');
    setPasswordMessage('');
  }, []);

  const handleNewPasswordChange = useCallback((value: string) => {
    setNewPassword(value);
    setPasswordError('');
    setPasswordMessage('');
  }, []);

  const handleUpdateName = useCallback(() => {
    const trimmedUsername = usernameInput.trim();

    if (!trimmedUsername) {
      setNameMessage('');
      return;
    }

    setUser((previous) => ({
      ...previous,
      username: trimmedUsername,
    }));
    setUsernameInput(trimmedUsername);
    setNameMessage('Username updated successfully.');

    console.log('profile:name-updated', { username: trimmedUsername });
  }, [usernameInput]);

  const handleChangePassword = useCallback(() => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      setPasswordError('Both password fields are required.');
      setPasswordMessage('');
      return;
    }

    if (newPassword.trim().length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      setPasswordMessage('');
      return;
    }

    setPasswordError('');
    setPasswordMessage('Password updated successfully.');
    console.log('profile:password-updated', {
      currentPassword,
      newPassword,
    });
    setCurrentPassword('');
    setNewPassword('');
  }, [currentPassword, newPassword]);

  return (
    <div className="space-y-8">
      <DashboardHeader subtitle="Manage your account settings" title="Profile" />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ProfileCard email={user.email} username={user.username} />
        <UpdateNameForm
          message={nameMessage}
          username={usernameInput}
          onSubmit={handleUpdateName}
          onUsernameChange={handleUsernameChange}
        />
      </section>

      <ChangePasswordForm
        currentPassword={currentPassword}
        errorMessage={passwordError}
        newPassword={newPassword}
        successMessage={passwordMessage}
        onCurrentPasswordChange={handleCurrentPasswordChange}
        onNewPasswordChange={handleNewPasswordChange}
        onSubmit={handleChangePassword}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="Total addresses"
          meta="Currently saved in your workspace"
          value={String(user.totalAddresses)}
        />
        <StatCard label="Last activity" meta="Recent account activity" value={user.lastActivity} />
      </section>
    </div>
  );
}
