"use client"

import React, { useState, useEffect } from 'react';
import { Search, Eye, Loader2, Trash2, Ban, CheckCircle, UserPlus, X } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button } from '@/app/root-components/Button';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedDrivers, setSelectedDrivers] = useState([]);

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/riders`;

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setDrivers(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire('Error', 'Failed to fetch drivers data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleAddDriver = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Register New Driver',
      html: `
        <div class="flex flex-col gap-2">
          <input id="swal-fname" class="swal2-input m-0" placeholder="First Name">
          <input id="swal-lname" class="swal2-input m-0" placeholder="Last Name">
          <input id="swal-email" class="swal2-input m-0" placeholder="Email">
          <input id="swal-phone" class="swal2-input m-0" placeholder="Phone">
          <input id="swal-city" class="swal2-input m-0" placeholder="Operation City (e.g. Dhaka)">
          <select id="swal-vtype" class="swal2-input m-0">
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Bike">Bike</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Register',
      confirmButtonColor: '#2FCA71',
      preConfirm: () => {
        const data = {
          firstName: document.getElementById('swal-fname').value,
          lastName: document.getElementById('swal-lname').value,
          email: document.getElementById('swal-email').value,
          phone: document.getElementById('swal-phone').value,
          address: { city: document.getElementById('swal-city').value },
          vehicle: { type: document.getElementById('swal-vtype').value }
        };
        if (!data.firstName || !data.email || !data.phone) {
          Swal.showValidationMessage('Please fill required fields');
        }
        return data;
      }
    });

    if (formValues) {
      try {
        await axios.post(API_URL, formValues);
        Swal.fire('Success', 'Driver registered successfully', 'success');
        fetchDrivers();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Registration failed', 'error');
      }
    }
  };

  // 2. VIEW DETAILS (Modal showing full info)
  const handleViewDetails = (driver) => {
    Swal.fire({
      title: `<strong>Driver Profile</strong>`,
      icon: 'info',
      html: `
        <div class="text-left text-sm space-y-2">
          <p><strong>Name:</strong> ${driver.name}</p>
          <p><strong>Email:</strong> ${driver.email}</p>
          <p><strong>Phone:</strong> ${driver.phone}</p>
          <p><strong>Gender:</strong> ${driver.gender || 'N/A'}</p>
          <p><strong>Vehicle:</strong> ${driver.vehicle?.model || 'N/A'} (${driver.vehicle?.number || 'N/A'})</p>
          <p><strong>License:</strong> ${driver.licenseNumber || 'N/A'}</p>
          <p><strong>Cities:</strong> ${driver.operationCities?.join(', ') || 'N/A'}</p>
          <p><strong>Joined:</strong> ${new Date(driver.createdAt).toLocaleDateString()}</p>
        </div>
      `,
      confirmButtonColor: '#2FCA71',
    });
  };

  // 3. TOGGLE APPROVAL
  const handleToggleApproval = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      await axios.patch(`${API_URL}/${id}`, { isApproved: nextStatus });
      setDrivers(drivers.map(d => d._id === id ? { ...d, isApproved: nextStatus } : d));

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
      Toast.fire({
        icon: 'success',
        title: `Driver ${nextStatus ? 'Approved' : 'Suspended'}`
      });
    } catch (err) {
      Swal.fire('Error', 'Update failed', 'error');
    }
  };

  // 4. DELETE (Single)
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This rider will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setDrivers(drivers.filter(d => d._id !== id));
        Swal.fire('Deleted!', 'Rider has been removed.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Delete failed', 'error');
      }
    }
  };

  // 5. BULK DELETE
  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: `Delete ${selectedDrivers.length} riders?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all'
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedDrivers.map(id => axios.delete(`${API_URL}/${id}`)));
        setDrivers(drivers.filter(d => !selectedDrivers.includes(d._id)));
        setSelectedDrivers([]);
        Swal.fire('Success', 'Selected drivers deleted', 'success');
      } catch (err) {
        Swal.fire('Error', 'Some deletions failed', 'error');
      }
    }
  };

  // Filtering Logic
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.includes(searchTerm);
    const matchesVehicle = vehicleFilter === 'All Vehicles' || driver.vehicle?.type === vehicleFilter;
    const driverStatus = driver.isApproved ? 'Approved' : 'Pending';
    const matchesStatus = statusFilter === 'All Status' || driverStatus === statusFilter;

    return matchesSearch && matchesVehicle && matchesStatus;
  });

  // Checkbox handlers
  const toggleSelect = (id) => {
    setSelectedDrivers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2FCA71]">Driver Management</h1>
            <p className="text-gray-600 mt-1">Real-time control of your rider fleet</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {selectedDrivers.length > 0 && (
              <Button onClick={handleBulkDelete} variant="outline" className="text-red-600 border-red-200 bg-red-50">
                Delete Selected ({selectedDrivers.length})
              </Button>
            )}
            <Button onClick={handleAddDriver} variant="primary" className="flex items-center gap-2">
              <UserPlus size={18} /> Add New Driver
            </Button>
          </div>
        </div>

        {/* Stats Cards (Dynamic) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Total Registered</p>
            <h2 className="text-3xl font-bold text-[#2FCA71] mt-2">{drivers.length}</h2>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Online Drivers</p>
            <h2 className="text-3xl font-bold text-blue-500 mt-2">{drivers.filter(d => d.isOnline).length}</h2>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Pending Approval</p>
            <h2 className="text-3xl font-bold text-orange-500 mt-2">{drivers.filter(d => !d.isApproved).length}</h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 border border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2FCA71]/20"
            />
          </div>
          <select onChange={(e) => setVehicleFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg outline-none">
            <option>All Vehicles</option>
            <option>Sedan</option>
            <option>SUV</option>
            <option>Bike</option>
          </select>
          <select onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg outline-none">
            <option>All Status</option>
            <option>Approved</option>
            <option>Pending</option>
          </select>
          <Button variant="outline" onClick={fetchDrivers}>Refresh</Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#2FCA71]" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        onChange={(e) => setSelectedDrivers(e.target.checked ? filteredDrivers.map(d => d._id) : [])}
                        checked={selectedDrivers.length === filteredDrivers.length && filteredDrivers.length > 0}
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Driver</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vehicle Info</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">City</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => (
                    <tr key={driver._id} className={`border-b border-gray-200 hover:bg-gray-50 transition ${selectedDrivers.includes(driver._id) ? 'bg-green-50/50' : ''}`}>
                      <td className="p-4 text-center">
                        <input type="checkbox" checked={selectedDrivers.includes(driver._id)} onChange={() => toggleSelect(driver._id)} />
                      </td>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0">
                          <img src={driver.image || 'https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg'} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{driver.name}</p>
                          <p className="text-xs text-gray-500">{driver.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{driver.vehicle?.type || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{driver.vehicle?.number || 'No Plate'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {driver.address?.city || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${driver.isApproved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {driver.isApproved ? 'Approved' : 'Pending'}
                        </span>
                        {driver.isOnline && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block animate-pulse" title="Online"></span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleViewDetails(driver)} className="p-2 hover:bg-blue-50 rounded-lg" title="View Details">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button onClick={() => handleToggleApproval(driver._id, driver.isApproved)} className="p-2 hover:bg-gray-100 rounded-lg">
                            {driver.isApproved ? <Ban className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                          </button>
                          <button onClick={() => handleDelete(driver._id)} className="p-2 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filteredDrivers.length === 0 && (
                <div className="p-10 text-center text-gray-500">No riders found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverManagement;