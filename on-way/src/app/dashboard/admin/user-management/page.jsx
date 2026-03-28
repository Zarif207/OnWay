"use client"

import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Eye, Ban, Loader2, Trash2, CheckCircle, Edit3, UserPlus } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button } from '@/app/root-components/Button';
import OnWayLoading from '@/app/components/Loading/page';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/passenger`;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      if (response.data.success) setUsers(response.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- NEW: ADD USER LOGIC ---
  const handleAddNewUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Add New User',
      html:
        `<input id="n-name" class="swal2-input" placeholder="Full Name">` +
        `<input id="n-email" class="swal2-input" placeholder="Email Address">` +
        `<input id="n-phone" class="swal2-input" placeholder="Phone Number">` +
        `<input id="n-pass" type="password" class="swal2-input" placeholder="Password">` +
        `<select id="n-role" class="swal2-input">
            <option value="user">User</option>
            <option value="rider">Rider</option>
            <option value="supportAgent">Support Agent</option>
            <option value="admin">Admin</option>
         </select>`,
      showCancelButton: true,
      confirmButtonText: 'Create User',
      confirmButtonColor: '#2FCA71',
      preConfirm: () => {
        const name = document.getElementById('n-name').value;
        const email = document.getElementById('n-email').value;
        const password = document.getElementById('n-pass').value;
        if (!name || !email || !password) {
          Swal.showValidationMessage('Name, Email and Password are required');
        }
        return {
          name, email, password,
          phone: document.getElementById('n-phone').value,
          role: document.getElementById('n-role').value
        }
      }
    });

    if (formValues) {
      try {
        const res = await axios.post(API_URL, formValues);
        if (res.data.success) {
          fetchUsers();
          Swal.fire('Success', 'User created successfully!', 'success');
        }
      } catch (err) {
        Swal.fire('Error', 'Failed to create user', 'error');
      }
    }
  };

  // --- NEW: BULK DELETE LOGIC ---
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      return Swal.fire('Wait', 'Please select users first', 'info');
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete ${selectedUsers.length} selected users?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!'
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${API_URL}/bulk-delete`, { ids: selectedUsers });
        setUsers(users.filter(u => !selectedUsers.includes(u._id)));
        setSelectedUsers([]);
        Swal.fire('Deleted!', 'Selected users removed.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Bulk delete failed', 'error');
      }
    }
  };

  // Checkbox handlers
  const toggleSelectUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Existing Actions
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2FCA71',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${API_URL}/${id}`);
        if (res.data.success) {
          setUsers(users.filter(u => u._id !== id));
          Swal.fire('Deleted!', 'User has been removed.', 'success');
        }
      } catch (err) {
        Swal.fire('Error', 'Delete failed', 'error');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    try {
      await axios.patch(`${API_URL}/status/${id}`, { status: nextStatus });
      setUsers(users.map(u => u._id === id ? { ...u, status: nextStatus } : u));
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      Toast.fire({ icon: 'success', title: `User set to ${nextStatus}` });
    } catch (err) {
      Swal.fire('Error', 'Status update failed', 'error');
    }
  };

  const handleEdit = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit User Profile',
      html:
        `<input id="swal-name" class="swal2-input" placeholder="Name" value="${user.name}">` +
        `<input id="swal-phone" class="swal2-input" placeholder="Phone" value="${user.phone || ''}">` +
        `<select id="swal-role" class="swal2-input">
            <option value="rider" ${user.role === 'rider' ? 'selected' : ''}>Rider</option>
            <option value="user" ${user.role === 'user' || user.role === 'passenger' ? 'selected' : ''}>User</option>
            <option value="supportAgent" ${user.role === 'supportAgent' ? 'selected' : ''}>Support Agent</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
         </select>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#2FCA71',
      preConfirm: () => {
        return {
          name: document.getElementById('swal-name').value,
          phone: document.getElementById('swal-phone').value,
          role: document.getElementById('swal-role').value
        }
      }
    });

    if (formValues) {
      try {
        const res = await axios.put(`${API_URL}/update/${user._id}`, formValues);
        if (res.data.success) {
          setUsers(users.map(u => u._id === user._id ? { ...u, ...formValues } : u));
          Swal.fire('Updated!', 'User info has been updated.', 'success');
        }
      } catch (err) {
        Swal.fire('Error', 'Update failed', 'error');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
 if (loading) {
    return (
      <OnWayLoading></OnWayLoading>
      
    );
  }
  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2FCA71]">User Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Real-time passenger account control</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              className={`w-full md:w-auto ${selectedUsers.length > 0 ? 'border-red-500 text-red-500' : ''}`}
              onClick={handleBulkDelete}
            >
              {selectedUsers.length > 0 ? `Delete (${selectedUsers.length})` : 'Bulk Actions'}
            </Button>
            <Button variant="primary" className="w-full md:w-auto flex items-center gap-2" onClick={handleAddNewUser}>
              <UserPlus className="w-4 h-4" /> Add New User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2FCA71] outline-none"
              />
            </div>
            <select
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg outline-none"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
            <Button variant="outline" onClick={fetchUsers}>Refresh Data</Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#2FCA71]" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-175">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      />
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className={`border-b border-gray-200 hover:bg-gray-50 transition ${selectedUsers.includes(user._id) ? 'bg-green-50' : ''}`}>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleSelectUser(user._id)}
                        />
                      </td>
                      <td className="py-4 px-4 flex items-center gap-3">
                        <img src={user.image || 'https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg'} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <p>{user.email}</p>
                        <p className="text-gray-500">{user.phone || 'No phone'}</p>
                      </td>
                      <td className="py-4 px-4 capitalize font-medium">{user.role}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(user.status || 'Active')}`}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(user)} className="p-2 hover:bg-blue-50 rounded-lg group" title="Edit Profile">
                            <Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user._id, user.status)}
                            className="p-2 rounded-lg group hover:bg-gray-100"
                            title={user.status === 'Suspended' ? "Unblock" : "Block"}
                          >
                            {user.status === 'Suspended' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Ban className="w-4 h-4 text-red-400" />}
                          </button>

                          <button onClick={() => handleDelete(user._id)} className="p-2 hover:bg-red-50 rounded-lg group" title="Delete">
                            <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;