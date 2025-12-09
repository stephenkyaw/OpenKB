
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User, UserRole } from '../types';
import { Shield, Mail, UserPlus, MoreVertical, Search, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

interface UserManagementViewProps {
  users: User[];
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

export const UsersPage: React.FC<UserManagementViewProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.VIEWER });
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter Users
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      ...newUser,
      lastActive: 'Never',
      status: 'Active'
    });
    setNewUser({ name: '', email: '', role: UserRole.VIEWER });
    setShowAddModal(false);
  };

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, "default" | "success" | "warning" | "error" | "outline"> = {
      [UserRole.ADMIN]: 'warning',
      [UserRole.EDITOR]: 'success',
      [UserRole.VIEWER]: 'outline'
    };
    return (
      <Badge variant={variants[role]}>
        {role === UserRole.ADMIN && <Shield size={10} className="mr-1.5" />}
        {role}
      </Badge>
    );
  };

  const InviteUserModal = () => (
    <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Invite New User" className="max-w-md">
      <form onSubmit={handleAddSubmit} className="space-y-6">
        <div>
          <Input
            label="Full Name"
            required
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
        </div>
        <div>
          <Input
            label="Email Address"
            required
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
        </div>
        <div>
          <Select
            label="Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
            options={[
              { value: UserRole.VIEWER, label: 'Viewer (Read Only)' },
              { value: UserRole.EDITOR, label: 'Editor (Can Index)' },
              { value: UserRole.ADMIN, label: 'Admin (Full Access)' }
            ]}
          />
        </div>

        <div className="pt-6 flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAddModal(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            Send Invite
          </Button>
        </div>
      </form>
    </Modal>
  );

  return (
    <div className="flex-1 overflow-auto bg-transparent p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-normal text-slate-900 tracking-tight mb-2">User Management</h1>
            <p className="text-slate-500 text-lg">Manage access and roles for your organization.</p>
          </div>
          {/* Extended FAB */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white/80 backdrop-blur-md text-primary-700 border border-white/60 px-6 py-4 rounded-[20px] hover:bg-white hover:shadow-lg transition-all flex items-center gap-3 shadow-sm font-bold group"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
              <UserPlus size={18} />
            </div>
            <span className="text-base">Invite User</span>
          </button>
        </div>

        {/* Users Table Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
          <div className="p-6 border-b border-white/50 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="block w-full pl-11 pr-4 py-3 bg-white/50 border border-white/50 rounded-full focus:ring-2 focus:ring-primary-500 text-sm transition-colors text-slate-900 placeholder-slate-400 font-medium"
              />
            </div>
            <div className="flex-1 text-right text-sm text-slate-500 font-bold uppercase tracking-wider">
              {filteredUsers.length} Users
            </div>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-white/50 text-slate-400 uppercase tracking-wider font-bold text-[11px] border-b border-white/50">
              <tr>
                <th className="px-8 py-5 text-xs">User</th>
                <th className="px-8 py-5 text-xs">Role</th>
                <th className="px-8 py-5 text-xs">Status</th>
                <th className="px-8 py-5 text-xs">Last Active</th>
                <th className="px-8 py-5 text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/50">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-primary-700 font-bold mr-4 text-base shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">{user.name}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5 font-medium">
                          <Mail size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-8 py-5">
                    <Badge variant={user.status === 'Active' ? 'success' : 'default'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-slate-500 font-medium">
                    {user.lastActive}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this user?')) onDeleteUser(user.id);
                      }}
                    >
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-8 py-4 border-t border-white/50 flex items-center justify-between bg-white/30 backdrop-blur-sm">
              <div className="text-sm text-slate-500 font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Render Modal */}
      <InviteUserModal />
    </div>
  );
};
