import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Shield,
  CheckCircle,
  AlertTriangle,
  KeyRound,
  Trash2,
  Send,
  Loader2,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { api } from '../api/client';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, refreshUser, updateUser, logout } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'password' | 'verify' | 'danger'

  // Edit details
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Password reset
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Email verification OTP
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Delete account
  const [deletePass, setDeletePass] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updated = await api.updateProfile({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      });
      updateUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    setIsChangingPass(true);
    try {
      await api.resetPassword(user.email, oldPass, newPass);
      toast.success('Password changed successfully!');
      setOldPass('');
      setNewPass('');
      setActiveTab('details');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSendVerifyOtp = async () => {
    setIsSendingOtp(true);
    try {
      await api.sendEmailOtp(user.email);
      setOtpSent(true);
      toast.success('Verification OTP sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    try {
      await api.verifyEmailOtp(user.email, otp.trim());
      toast.success('Email verified successfully!');
      await refreshUser();
      setActiveTab('details');
    } catch (err) {
      toast.error(err.message || 'Invalid or expired OTP');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePass) {
      toast.error('Please enter your password to confirm');
      return;
    }
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await api.deleteAccount(user.id, deletePass);
      toast.success('Account deleted successfully');
      logout();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-base font-bold shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>{user.name}</span>
                {user.is_verified && (
                  <BadgeCheck className="w-4 h-4 text-emerald-500 inline" title="Verified Account" />
                )}
              </h2>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-700/80 px-6 gap-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'details', label: 'Profile Details' },
            { id: 'password', label: 'Security' },
            { id: 'verify', label: 'Email Verification' },
            { id: 'danger', label: 'Danger Zone' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3 px-2 border-b-2 transition whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  Role: {user.is_main_admin ? 'Main Administrator' : user.role === 'admin' ? 'Administrator' : 'Standard User'}
                </span>
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                    user.is_verified
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {user.is_verified ? 'Verified Email' : 'Email Unverified'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PASSWORD CHANGE */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
                >
                  {isChangingPass && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EMAIL VERIFICATION */}
          {activeTab === 'verify' && (
            <div className="space-y-4">
              {user.is_verified ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                      Your email is verified!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      You receive official updates and task reminder notifications.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 font-medium">
                    Your email <span className="font-bold">{user.email}</span> is not verified yet. Verify it to unlock automated task reminders.
                  </div>

                  {!otpSent ? (
                    <button
                      onClick={handleSendVerifyOtp}
                      disabled={isSendingOtp}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
                    >
                      {isSendingOtp ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Send Verification Code</span>
                    </button>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                          Enter 4-Digit OTP
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="1234"
                          className="w-full text-center text-lg font-bold tracking-widest px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isVerifyingOtp}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
                      >
                        {isVerifyingOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Verify & Confirm</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DANGER ZONE */}
          {activeTab === 'danger' && (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                  <span className="font-bold">Warning:</span> Deleting your account will soft-delete your profile and tasks. Enter your password below to confirm deletion.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={deletePass}
                  onChange={(e) => setDeletePass(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20 text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isDeleting}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete My Account</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
