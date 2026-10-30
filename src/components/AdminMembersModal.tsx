import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  DollarSign,
  CreditCard,
  Crown,
  Trash2,
  Edit2,
  Check,
  Plus,
  ArrowRightLeft,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { AppUser, SubscriptionSettings, UserRole, MembershipTier } from '../types';

interface AdminMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  currentUser: AppUser | null;
  subscriptionSettings: SubscriptionSettings;
  onUpdateUsers: (users: AppUser[]) => void;
  onUpdateSubscriptionSettings: (settings: SubscriptionSettings) => void;
  onSwitchUser: (user: AppUser) => void;
  onOpenImageStudio: () => void;
}

export const AdminMembersModal: React.FC<AdminMembersModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  subscriptionSettings,
  onUpdateUsers,
  onUpdateSubscriptionSettings,
  onSwitchUser,
  onOpenImageStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'pricing'>('members');
  const [showAllPasswords, setShowAllPasswords] = useState<boolean>(true); // Default open for admin inspection
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string>('');
  const [isAddingUser, setIsAddingUser] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('MEMBER');
  const [newTier, setNewTier] = useState<MembershipTier>('FREE');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Stats
  const totalUsers = users.length;
  const paidCount = users.filter((u) => u.isPaid).length;
  const freeCount = totalUsers - paidCount;
  const projectedRevenue = (paidCount * subscriptionSettings.monthlyPrice).toFixed(2);

  // Toggle paid status for user
  const handleTogglePaid = (userId: string) => {
    onUpdateUsers(
      users.map((u) => {
        if (u.id === userId) {
          const nextIsPaid = !u.isPaid;
          return {
            ...u,
            isPaid: nextIsPaid,
            membershipTier: nextIsPaid ? 'PRO_MONTHLY' : 'FREE',
          };
        }
        return u;
      })
    );
  };

  // Change tier
  const handleChangeTier = (userId: string, tier: MembershipTier) => {
    onUpdateUsers(
      users.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            membershipTier: tier,
            isPaid: tier !== 'FREE',
          };
        }
        return u;
      })
    );
  };

  // Save edited password
  const handleSavePassword = (userId: string) => {
    if (!tempPassword.trim()) return;
    onUpdateUsers(
      users.map((u) => (u.id === userId ? { ...u, password: tempPassword.trim() } : u))
    );
    setEditingUserId(null);
    setTempPassword('');
  };

  // Delete user safely without browser alert/confirm
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      setStatusMessage('Cannot delete your own active admin account.');
      setTimeout(() => setStatusMessage(null), 3500);
      return;
    }
    onUpdateUsers(users.filter((u) => u.id !== userId));
    setDeleteConfirmUserId(null);
    setStatusMessage('Member successfully removed.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Add new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const cleanUser = newUsername.trim().toLowerCase();
    if (!cleanUser || !newPassword) {
      setFormError('Please enter both username and password');
      return;
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      setFormError('Username already exists');
      return;
    }

    const newUser: AppUser = {
      id: `usr_${Date.now()}`,
      username: cleanUser,
      password: newPassword,
      role: newRole,
      membershipTier: newTier,
      isPaid: newTier !== 'FREE',
      createdAt: new Date().toISOString().split('T')[0],
      workoutCount: 0,
    };

    onUpdateUsers([...users, newUser]);
    setIsAddingUser(false);
    setNewUsername('');
    setNewPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/60 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-slate-900">
                  Admin Control Center
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 uppercase">
                  Admin Access
                </span>
              </div>
              <p className="text-xs text-slate-500">
                View member credentials, passwords & manage paid subscriptions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenImageStudio();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200/70 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image Studio</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs font-semibold text-amber-900 animate-in fade-in duration-150">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-amber-600 hover:text-amber-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation & Revenue Bar */}
        <div className="bg-slate-50/80 px-4 sm:px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'members'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Members & Passwords ({totalUsers})</span>
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pricing'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Paid Service Settings</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs">
            <div className="bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl text-emerald-800 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Paid: {paidCount}</span>
            </div>
            <div className="bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-xl text-slate-700 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Free: {freeCount}</span>
            </div>
            <div className="hidden sm:flex bg-sky-50 border border-sky-200/80 px-2.5 py-1 rounded-xl text-sky-800 font-semibold items-center gap-1">
              <span>MRR: ${projectedRevenue}</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Members Table */}
        {activeTab === 'members' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAllPasswords(!showAllPasswords)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    showAllPasswords
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {showAllPasswords ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                      <span>Hide Passwords</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reveal Passwords</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Admin privilege: passwords visible for member support
                </span>
              </div>

              <button
                onClick={() => setIsAddingUser(!isAddingUser)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            {/* Add User Drawer / Form */}
            {isAddingUser && (
              <form
                onSubmit={handleCreateUser}
                className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl space-y-3 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-xs text-sky-950 uppercase tracking-wider">
                    Create New Account
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                {formError && (
                  <p className="text-xs text-rose-600 font-semibold">{formError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="h-9 px-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="MEMBER">Role: Member</option>
                    <option value="ADMIN">Role: Admin</option>
                  </select>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as MembershipTier)}
                    className="h-9 px-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="FREE">Tier: Free</option>
                    <option value="PRO_MONTHLY">Tier: Pro Paid</option>
                    <option value="VIP_ANNUAL">Tier: VIP Annual</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 shadow-xs"
                  >
                    Save & Add Member
                  </button>
                </div>
              </form>
            )}

            {/* Members List Cards */}
            <div className="space-y-2.5">
              {users.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                const isEditingThis = editingUserId === u.id;

                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-sky-50/40 border-sky-200 shadow-xs ring-1 ring-sky-500/20'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            u.role === 'ADMIN'
                              ? 'bg-slate-900 text-amber-300 shadow-xs'
                              : u.isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.username.slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-sm text-slate-900">
                              {u.username}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-700">
                                You
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                u.role === 'ADMIN'
                                  ? 'bg-slate-900 text-amber-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Joined {u.createdAt} · {u.workoutCount} workouts
                          </span>
                        </div>
                      </div>

                      {/* Password Field (Admin Viewing) */}
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={tempPassword}
                              onChange={(e) => setTempPassword(e.target.value)}
                              className="h-6 w-24 px-1.5 text-xs bg-white border border-slate-300 rounded font-mono"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePassword(u.id)}
                              className="text-emerald-600 hover:text-emerald-700 p-0.5"
                              title="Save password"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-semibold text-slate-700 select-all">
                              {showAllPasswords ? u.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => {
                                setEditingUserId(u.id);
                                setTempPassword(u.password);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-0.5 ml-1"
                              title="Change password"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Membership Status & Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Paid Toggle */}
                        <button
                          onClick={() => handleTogglePaid(u.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                            u.isPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Click to toggle between Free and Paid"
                        >
                          {u.isPaid ? (
                            <>
                              <Crown className="w-3 h-3 text-emerald-600" />
                              <span>Paid Pro</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                              <span>Free Tier</span>
                            </>
                          )}
                        </button>

                        {/* Switch user / preview as this user */}
                        <button
                          onClick={() => {
                            onSwitchUser(u);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 text-xs font-semibold flex items-center gap-1 border border-slate-200/80 transition-colors"
                          title="Test app as this user"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span className="hidden sm:inline">Login As</span>
                        </button>

                        {/* Delete button (except self) */}
                        {!isCurrent && (
                          deleteConfirmUserId === u.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-in fade-in">
                              <span className="text-[10px] font-bold text-rose-700 pl-1">Delete?</span>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirmUserId(null)}
                                className="px-1.5 py-0.5 rounded-lg text-slate-500 hover:bg-slate-200 text-[10px]"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmUserId(u.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Pricing & Future Paid Service Settings */}
        {activeTab === 'pricing' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Paywall Toggle Card */}
            <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-white p-5 rounded-3xl border border-amber-200/80 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <h4 className="font-heading font-bold text-base text-slate-900">
                      Paid Subscription Paywall
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                    Enable to monetize the app. When turned ON, members on the Free Tier can complete up to {subscriptionSettings.freeWorkoutLimit} workouts before being asked to subscribe to Pro.
                  </p>
                </div>

                <button
                  onClick={() =>
                    onUpdateSubscriptionSettings({
                      ...subscriptionSettings,
                      paywallEnabled: !subscriptionSettings.paywallEnabled,
                    })
                  }
                  className={`p-1.5 rounded-2xl transition-all shrink-0 ${
                    subscriptionSettings.paywallEnabled
                      ? 'text-sky-600 hover:text-sky-700'
                      : 'text-slate-400 hover:text-slate-500'
                  }`}
                >
                  {subscriptionSettings.paywallEnabled ? (
                    <ToggleRight className="w-10 h-10" />
                  ) : (
                    <ToggleLeft className="w-10 h-10" />
                  )}
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Current Status:{' '}
                  <span
                    className={
                      subscriptionSettings.paywallEnabled
                        ? 'text-emerald-700 font-bold'
                        : 'text-slate-500 font-bold'
                    }
                  >
                    {subscriptionSettings.paywallEnabled
                      ? '● ACTIVE (Paywall Enforced)'
                      : '○ INACTIVE (Free Access)'}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Admins and Paid Pro members always have unrestricted access
                </span>
              </div>
            </div>

            {/* Pricing Parameters */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-600" />
                <span>Subscription Plan Rates</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Monthly */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Monthly Plan ($/mo)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 font-bold text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={subscriptionSettings.monthlyPrice}
                      onChange={(e) =>
                        onUpdateSubscriptionSettings({
                          ...subscriptionSettings,
                          monthlyPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Annual */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Annual VIP Plan ($/yr)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 font-bold text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={subscriptionSettings.annualPrice}
                      onChange={(e) =>
                        onUpdateSubscriptionSettings({
                          ...subscriptionSettings,
                          annualPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Free Trial Limit */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Free Workouts Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={subscriptionSettings.freeWorkoutLimit}
                    onChange={(e) =>
                      onUpdateSubscriptionSettings({
                        ...subscriptionSettings,
                        freeWorkoutLimit: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Feature Comparison Preview */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <h4 className="font-heading font-bold text-sm text-slate-900">
                Tier Entitlements Breakdown
              </h4>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600">360° Anatomical Mannequin Rotation</span>
                  <div className="flex gap-6 font-semibold">
                    <span className="text-slate-700">Free</span>
                    <span className="text-emerald-600">Pro</span>
                  </div>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600">30-Day Automated Structured Programs</span>
                  <div className="flex gap-6 font-semibold">
                    <span className="text-slate-400">Limit {subscriptionSettings.freeWorkoutLimit}</span>
                    <span className="text-emerald-600">Unlimited</span>
                  </div>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600">Water Interval Alarm & Hydration Tracker</span>
                  <div className="flex gap-6 font-semibold">
                    <span className="text-emerald-600">Included</span>
                    <span className="text-emerald-600">Included</span>
                  </div>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600">Admin Image Studio Customization</span>
                  <div className="flex gap-6 font-semibold">
                    <span className="text-slate-400">Hidden</span>
                    <span className="text-sky-700">Admin Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>GoldenBar Membership & Monetization Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
