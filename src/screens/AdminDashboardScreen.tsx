import React, { useState } from 'react';
import {
  Users,
  Dumbbell,
  ShieldCheck,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Trash2,
  Plus,
  Sparkles,
  Search,
  Filter,
  LogOut,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserX,
  AlertCircle,
  Sliders,
  DollarSign
} from 'lucide-react';
import { AppUser, Exercise, MuscleGroup, AdminImageConfig, UserRole } from '../types';
import { CHARACTER_IMAGE, CHARACTER_BACK_IMAGE } from '../data/exercises';

interface AdminDashboardScreenProps {
  currentUser: AppUser;
  allUsers: AppUser[];
  onUpdateUsers: (users: AppUser[]) => void;
  exercises: Exercise[];
  onUpdateExercises: (exercises: Exercise[]) => void;
  imageConfig: AdminImageConfig;
  onUpdateImageConfig: (config: AdminImageConfig) => void;
  onLogout: () => void;
}

const PRESET_WORKOUT_IMAGES = [
  { name: 'GoldenBar 3D Character (Front)', url: CHARACTER_IMAGE, tag: '3D Front' },
  { name: 'GoldenBar 3D Character (Back)', url: CHARACTER_BACK_IMAGE, tag: '3D Back' },
  {
    name: 'Bench Press (Chest)',
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
    tag: 'Chest',
  },
  {
    name: 'Cable & Lat Pulldown (Back)',
    url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop&q=80',
    tag: 'Back',
  },
  {
    name: 'Overhead Shoulder Press',
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    tag: 'Shoulders',
  },
  {
    name: 'Bicep Dumbbell Curl',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
    tag: 'Arms',
  },
  {
    name: 'Barbell Deep Squat (Legs)',
    url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    tag: 'Legs',
  },
  {
    name: 'Core Plank & Abs',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    tag: 'Core',
  },
];

const MUSCLE_FILTER_OPTIONS: { label: string; value: MuscleGroup | 'ALL' }[] = [
  { label: 'All Muscles', value: 'ALL' },
  { label: 'Chest', value: 'CHEST' },
  { label: 'Back', value: 'BACK' },
  { label: 'Shoulders', value: 'SHOULDERS' },
  { label: 'Biceps', value: 'BICEPS' },
  { label: 'Triceps', value: 'TRICEPS' },
  { label: 'Legs', value: 'LEGS' },
  { label: 'Core', value: 'CORE' },
  { label: 'Warm-up', value: 'WARMUP' },
];

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  currentUser,
  allUsers,
  onUpdateUsers,
  exercises,
  onUpdateExercises,
  imageConfig,
  onUpdateImageConfig,
  onLogout,
}) => {
  // Tabs: 'users' (1st tab) or 'exercises' (2nd tab)
  const [activeTab, setActiveTab] = useState<'users' | 'exercises'>('users');

  // Tab 1: Users State
  const [userSearch, setUserSearch] = useState<string>('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newIsPaid, setNewIsPaid] = useState<boolean>(false);
  const [newRole, setNewRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [addUserError, setAddUserError] = useState<string | null>(null);

  // Tab 2: Exercises State
  const [exerciseSearch, setExerciseSearch] = useState<string>('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'ALL'>('ALL');
  const [selectedExerciseForEdit, setSelectedExerciseForEdit] = useState<Exercise | null>(null);

  // Edit Modal State
  const [editName, setEditName] = useState<string>('');
  const [editImage, setEditImage] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editStepsText, setEditStepsText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ----------------------------------------------------
  // User Management Handlers
  // ----------------------------------------------------
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleCopyPassword = (userId: string, pass: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pass);
      setCopiedId(userId);
      setTimeout(() => setCopiedId(null), 2000);
      showToast('Password copied to clipboard!');
    }
  };

  const handleTogglePaidStatus = (user: AppUser) => {
    const updatedUsers = allUsers.map((u) => {
      if (u.id === user.id) {
        const nextPaid = !u.isPaid;
        return {
          ...u,
          isPaid: nextPaid,
          membershipTier: nextPaid ? ('PRO_MONTHLY' as const) : ('FREE' as const),
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
    showToast(`Updated ${user.username} to ${!user.isPaid ? 'PAID PRO' : 'FREE'}`);
  };

  const handleDeleteUser = (user: AppUser) => {
    if (user.id === currentUser.id) {
      showToast('Cannot delete your own active admin account!');
      return;
    }
    const filtered = allUsers.filter((u) => u.id !== user.id);
    onUpdateUsers(filtered);
    showToast(`Removed user ${user.username}`);
  };

  const handleToggleAdminRole = (user: AppUser) => {
    if (user.id === currentUser.id) {
      showToast('Cannot change role of your own logged-in admin account');
      return;
    }
    const nextRole: UserRole = user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    const updatedUsers = allUsers.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          role: nextRole,
          isPaid: nextRole === 'ADMIN' ? true : u.isPaid,
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
    showToast(
      nextRole === 'ADMIN'
        ? `Promoted ${user.username} to Admin!`
        : `Demoted ${user.username} back to Member`
    );
  };

  const handleOpenAddAdminModal = () => {
    setNewRole('ADMIN');
    setNewIsPaid(true);
    setNewUsername('');
    setNewPassword('');
    setAddUserError(null);
    setShowAddUserModal(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);
    const cleanUsername = newUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setAddUserError('Please provide a username');
      return;
    }
    if (!newPassword || newPassword.length < 3) {
      setAddUserError('Password must be at least 3 characters');
      return;
    }
    if (allUsers.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setAddUserError('Username already exists');
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const newUser: AppUser = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      password: newPassword,
      role: newRole,
      membershipTier: newIsPaid ? 'PRO_MONTHLY' : 'FREE',
      isPaid: newIsPaid,
      createdAt: todayDate,
      workoutCount: 0,
    };

    onUpdateUsers([...allUsers, newUser]);
    setShowAddUserModal(false);
    setNewUsername('');
    setNewPassword('');
    setNewIsPaid(false);
    setNewRole('MEMBER');
    showToast(`Added new user ${newUser.username} successfully!`);
  };

  // ----------------------------------------------------
  // Exercise Edit Handlers
  // ----------------------------------------------------
  const handleOpenEditExercise = (exercise: Exercise) => {
    setSelectedExerciseForEdit(exercise);
    setEditName(exercise.name);
    // Current image or override
    const currentImg =
      imageConfig.exerciseOverrides[exercise.id] ||
      exercise.media ||
      (exercise.muscle === 'BACK' ? imageConfig.backCharacter : imageConfig.frontCharacter);
    setEditImage(currentImg);
    // First step or combined steps
    setEditDescription(exercise.steps[0] || 'Perform with controlled movement and proper form.');
    setEditStepsText(exercise.steps.join('\n'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image file too large (max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setEditImage(result);
          showToast('Image uploaded successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveExerciseChanges = () => {
    if (!selectedExerciseForEdit) return;

    const trimmedName = editName.trim() || selectedExerciseForEdit.name;
    const splitSteps = editStepsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedSteps = splitSteps.length > 0 ? splitSteps : [editDescription];

    // 1. Update the Exercise in the database
    const updatedExercises = exercises.map((ex) => {
      if (ex.id === selectedExerciseForEdit.id) {
        return {
          ...ex,
          name: trimmedName,
          media: editImage,
          steps: updatedSteps,
        };
      }
      return ex;
    });

    onUpdateExercises(updatedExercises);

    // 2. Update Image Config Overrides
    const newOverrides = {
      ...imageConfig.exerciseOverrides,
      [selectedExerciseForEdit.id]: editImage,
    };
    onUpdateImageConfig({
      ...imageConfig,
      exerciseOverrides: newOverrides,
    });

    setSelectedExerciseForEdit(null);
    showToast(`Saved changes for ${trimmedName}!`);
  };

  // Filtered Users
  const filteredUsers = allUsers.filter((u) =>
    u.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filtered Exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.muscle.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle = muscleFilter === 'ALL' || ex.muscle === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-6 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-sky-700 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  GoldenBar Admin Dashboard
                </h1>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                  Owner
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Admin Control & Management Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-700">Logged in as {currentUser.username}</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs"
              title="Sign out of Admin Dashboard"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col">
        {/* Navigation Tabs - Clean Matching Narrow Tile Format */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white border-sky-500 shadow-sm ring-2 ring-sky-500/20'
                : 'bg-white/80 border-slate-200/90 hover:bg-white text-slate-600 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  activeTab === 'users'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 truncate">
                  Users & Accounts
                </h3>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'users'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {allUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('exercises')}
            className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between cursor-pointer ${
              activeTab === 'exercises'
                ? 'bg-white border-sky-500 shadow-sm ring-2 ring-sky-500/20'
                : 'bg-white/80 border-slate-200/90 hover:bg-white text-slate-600 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  activeTab === 'exercises'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 truncate">
                  All Exercises
                </h3>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'exercises'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {exercises.length}
            </span>
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: USERS & ACCOUNTS                               */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Top Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Total Accounts
                </span>
                <span className="font-heading font-bold text-2xl text-slate-900">
                  {allUsers.length}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-emerald-600 block uppercase">
                  Paid Pro Members
                </span>
                <span className="font-heading font-bold text-2xl text-emerald-700">
                  {allUsers.filter((u) => u.isPaid).length}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                  Free Members
                </span>
                <span className="font-heading font-bold text-2xl text-slate-700">
                  {allUsers.filter((u) => !u.isPaid && u.role === 'MEMBER').length}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-amber-600 block uppercase">
                  Admins
                </span>
                <span className="font-heading font-bold text-2xl text-amber-700">
                  {allUsers.filter((u) => u.role === 'ADMIN').length}
                </span>
              </div>
            </div>

            {/* Filter & Add User Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by username..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenAddAdminModal}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Create a new administrator account"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>+ Add New Admin</span>
                </button>

                <button
                  onClick={() => {
                    setNewRole('MEMBER');
                    setNewIsPaid(false);
                    setNewUsername('');
                    setNewPassword('');
                    setAddUserError(null);
                    setShowAddUserModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Member</span>
                </button>
              </div>
            </div>

            {/* List of Users in Matching Tile Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((user) => {
                const isPasswordShown = !!visiblePasswords[user.id];
                const isCurrentUser = user.id === currentUser.id;

                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    {/* User Header Tile Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-bold text-base shadow-2xs ${
                            user.role === 'ADMIN'
                              ? 'bg-slate-900 text-amber-300'
                              : user.isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-base text-slate-900">
                              {user.username}
                            </h4>
                            {isCurrentUser && (
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>

                      {/* Role & Paid Status Badges */}
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            user.role === 'ADMIN'
                              ? 'bg-slate-900 text-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {user.role}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            user.isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {user.isPaid ? (
                            <>
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                              <span>PAID PRO</span>
                            </>
                          ) : (
                            <span>FREE</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Data Fields: Password, Joining Date, Free/Paid */}
                    <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2.5 border border-slate-200/60">
                      {/* Password Field */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Password:</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800 font-semibold text-xs tracking-wider select-all">
                            {isPasswordShown ? user.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                            title={isPasswordShown ? 'Hide password' : 'Show password'}
                          >
                            {isPasswordShown ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopyPassword(user.id, user.password)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-200 transition-colors"
                            title="Copy password"
                          >
                            {copiedId === user.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Joining Date Field */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Joining Date:</span>
                        </span>
                        <span className="font-semibold text-slate-800 font-mono bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                          {user.createdAt || '2026-10-01'}
                        </span>
                      </div>

                      {/* Workouts Logged */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
                          <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
                          <span>Workouts Logged:</span>
                        </span>
                        <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                          {user.workoutCount || 0} sessions
                        </span>
                      </div>
                    </div>

                    {/* Action Bar: Free/Paid Toggle, Make Admin & Delete */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleTogglePaidStatus(user)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            user.isPaid
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                          title="Toggle Free or Paid status"
                        >
                          {user.isPaid ? (
                            <>
                              <UserX className="w-3.5 h-3.5 text-amber-600" />
                              <span>Free</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Make Paid Pro</span>
                            </>
                          )}
                        </button>

                        {!isCurrentUser && (
                          <button
                            onClick={() => handleToggleAdminRole(user)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              user.role === 'ADMIN'
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                                : 'bg-gradient-to-r from-amber-400/20 to-yellow-400/30 text-amber-950 hover:bg-amber-200/50 border border-amber-300'
                            }`}
                            title={user.role === 'ADMIN' ? 'Remove admin privileges' : 'Promote this member to Administrator'}
                          >
                            <ShieldCheck className={`w-3.5 h-3.5 ${user.role === 'ADMIN' ? 'text-slate-500' : 'text-amber-700'}`} />
                            <span>{user.role === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}</span>
                          </button>
                        )}
                      </div>

                      {!isCurrentUser && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: ALL EXERCISES & MEDIA                          */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search exercise by name or muscle..."
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="text-xs text-slate-500 font-medium shrink-0">
                  Showing <strong>{filteredExercises.length}</strong> of{' '}
                  {exercises.length} exercises
                </div>
              </div>

              {/* Muscle Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {MUSCLE_FILTER_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setMuscleFilter(item.value)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      muscleFilter === item.value
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction Tip */}
            <div className="p-3.5 bg-sky-50 border border-sky-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-sky-900">
              <ImageIcon className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>Admin Workout Manager:</strong> Click on any workout card or image below to modify its name, replace the image, or customize the description and instructions.
              </span>
            </div>

            {/* Grid of Exercise Tiles (Same Tile Format as App) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => {
                const activeImg =
                  imageConfig.exerciseOverrides[exercise.id] ||
                  exercise.media ||
                  (exercise.muscle === 'BACK'
                    ? imageConfig.backCharacter
                    : imageConfig.frontCharacter);

                const isCustomImage = !!imageConfig.exerciseOverrides[exercise.id];

                return (
                  <div
                    key={exercise.id}
                    onClick={() => handleOpenEditExercise(exercise)}
                    className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    {/* Workout Image Tile */}
                    <div className="relative aspect-4/3 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={activeImg}
                        alt={exercise.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to default front character
                          (e.target as HTMLImageElement).src = CHARACTER_IMAGE;
                        }}
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                        <div className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-md">
                          <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>Click to Edit</span>
                        </div>
                      </div>

                      {/* Muscle Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 shadow-xs uppercase tracking-wider">
                          {exercise.muscle}
                        </span>
                      </div>

                      {/* Custom Override Indicator */}
                      {isCustomImage && (
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                            Custom Image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Workout Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="font-heading font-bold text-base text-slate-900 group-hover:text-sky-600 transition-colors">
                          {exercise.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {exercise.steps[0] || 'Click to add instructions and description.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {exercise.equipment || 'Bodyweight'}
                        </span>
                        <span className="text-sky-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Edit Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD NEW USER                                   */}
      {/* ---------------------------------------------------- */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Add New User Account
                  </h3>
                  <span className="text-xs text-slate-500">
                    Set up credentials and plan status
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addUserError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addUserError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. josh_fit"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Password
                </label>
                <input
                  type="text"
                  placeholder="e.g. gym1234"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Free / Paid Status
                  </label>
                  <select
                    value={newIsPaid ? 'PAID' : 'FREE'}
                    onChange={(e) => setNewIsPaid(e.target.value === 'PAID')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="FREE">FREE</option>
                    <option value="PAID">PAID PRO</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: EDIT EXERCISE (Name, Image, Description)       */}
      {/* ---------------------------------------------------- */}
      {selectedExerciseForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    Edit Workout Exercise
                  </h3>
                  <span className="text-xs text-slate-500">
                    Modify exercise name, change image & update description
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedExerciseForEdit(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="py-4 space-y-5 overflow-y-auto pr-1">
              {/* 1. Exercise Name Input */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Exercise name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* 2. Change Image Option */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Workout Image
                </label>

                {/* Active Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs">
                    <img
                      src={editImage}
                      alt={editName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = CHARACTER_IMAGE;
                      }}
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/70 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded-md text-center truncate">
                      Active Image Preview
                    </div>
                  </div>

                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-1">
                        Paste Custom Image URL
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          placeholder="https://... image link"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-1">
                        Or Upload From Device
                      </span>
                      <label className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-dashed border-sky-300 hover:border-sky-500 rounded-xl text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-50/50 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Image File (JPG/PNG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditImage(CHARACTER_IMAGE)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset to GoldenBar 3D character default</span>
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="mt-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Select from Ready-to-Use Fitness Presets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_WORKOUT_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setEditImage(preset.url)}
                        className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          editImage === preset.url
                            ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 bg-slate-100"
                        />
                        <div className="truncate">
                          <span className="text-[10px] font-bold text-slate-800 block truncate">
                            {preset.tag}
                          </span>
                          <span className="text-[9px] text-slate-400 block truncate">
                            {preset.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Description & Steps Editor */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Exercise Description & Coaching Steps
                </label>
                <textarea
                  rows={4}
                  value={editStepsText}
                  onChange={(e) => setEditStepsText(e.target.value)}
                  placeholder="Enter execution steps or cues (one per line)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium leading-relaxed"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Tip: Put each instructional coaching step on its own line.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedExerciseForEdit(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveExerciseChanges}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
