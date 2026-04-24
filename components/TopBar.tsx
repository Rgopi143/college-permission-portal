
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { supabaseService } from '../services/supabaseService';
import { ProfileService, ProfileUpdate } from '../services/profileService';

interface TopBarProps {
  user: User;
  isDarkMode: boolean;
  onToggleDark: () => void;
  onMenuToggle?: () => void;
  onLogout?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, isDarkMode, onToggleDark, onMenuToggle, onLogout }) => {
  const isCloudConnected = supabaseService.isAvailable();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Add custom scrollbar styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .settings-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .settings-scrollbar::-webkit-scrollbar-track {
        background: ${isDarkMode ? '#1e293b' : '#f1f5f9'};
        border-radius: 3px;
      }
      .settings-scrollbar::-webkit-scrollbar-thumb {
        background: ${isDarkMode ? '#475569' : '#cbd5e1'};
        border-radius: 3px;
      }
      .settings-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${isDarkMode ? '#64748b' : '#94a3b8'};
      }
      .settings-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: ${isDarkMode ? '#475569 #1e293b' : '#cbd5e1 #f1f5f9'};
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [isDarkMode]);
  const [editedUser, setEditedUser] = useState({
    ...user,
    phone: '+91 98765 43210',
    bio: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    address: '',
    city: '',
    state: '',
    postal_code: ''
  });
  const [profileImage, setProfileImage] = useState(`https://picsum.photos/seed/${user.id}/100`);

  // Fetch profile image from database on component mount
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const imageUrl = await ProfileService.getProfileImage(user.id);
        if (imageUrl) {
          setProfileImage(imageUrl);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    fetchProfileImage();
  }, [user.id]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Empty notifications data
  const [notifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
        setIsEditing(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileEdit = () => {
    setIsEditing(true);
    setEditedUser({...user, phone: editedUser.phone || '+91 98765 43210'});
  };

  const handleSettings = () => {
    console.log('Settings clicked, current state:', showSettings);
    setShowSettings(!showSettings);
    setShowProfile(false);
    console.log('Settings new state:', !showSettings);
  };

  const handleExportData = () => {
    try {
      const userData = {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        student_id: user.student_id,
        phone: editedUser.phone,
        bio: editedUser.bio,
        date_of_birth: editedUser.date_of_birth,
        gender: editedUser.gender,
        blood_group: editedUser.blood_group,
        emergency_contact_name: editedUser.emergency_contact_name,
        emergency_contact_phone: editedUser.emergency_contact_phone,
        address: editedUser.address,
        city: editedUser.city,
        state: editedUser.state,
        postal_code: editedUser.postal_code
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `profile_data_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Profile data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const handleClearCache = () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear session storage
      sessionStorage.clear();
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      alert('Cache cleared successfully! Please refresh the page.');
    } catch (error) {
      console.error('Clear cache error:', error);
      alert('Error clearing cache. Please try again.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsEditing(true); // Show loading state
      
      // Check if user is authenticated
      if (!user || !user.id) {
        alert('User not authenticated. Please log in again.');
        setIsEditing(false);
        return;
      }
      
      // Validate required fields
      if (!editedUser.name || editedUser.name.trim() === '') {
        alert('Name is required');
        setIsEditing(false);
        return;
      }
      
      if (!editedUser.email || editedUser.email.trim() === '') {
        alert('Email is required');
        setIsEditing(false);
        return;
      }
      
      // Update profile in database
      const updates: ProfileUpdate = {
        name: editedUser.name?.trim(),
        email: editedUser.email?.trim(),
        phone: editedUser.phone?.trim(),
        bio: editedUser.bio?.trim(),
        date_of_birth: editedUser.date_of_birth?.trim(),
        gender: editedUser.gender?.trim(),
        blood_group: editedUser.blood_group?.trim(),
        emergency_contact_name: editedUser.emergency_contact_name?.trim(),
        emergency_contact_phone: editedUser.emergency_contact_phone?.trim(),
        address: editedUser.address?.trim(),
        city: editedUser.city?.trim(),
        state: editedUser.state?.trim(),
        postal_code: editedUser.postal_code?.trim()
      };

      console.log('Attempting to update profile with:', updates);
      const result = await ProfileService.updateProfile(user.id, updates);
      console.log('Profile update result:', result);
      
      if (result.success) {
        // Update local user state
        setEditedUser(prev => ({ ...prev, ...updates }));
        setProfileImage(editedUser.avatar_url || profileImage);
        
        // Show success message
        alert('Profile updated successfully!');
        
        setIsEditing(false);
        setShowProfile(false);
      } else {
        // Show error message
        console.error('Profile update failed:', result.error);
        alert(`Error updating profile: ${result.error}`);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile save error:', error);
      alert('Error updating profile. Please try again.');
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser({
      ...user,
      phone: '+91 98765 43210',
      bio: '',
      date_of_birth: '',
      gender: '',
      blood_group: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: '',
      address: '',
      city: '',
      state: '',
      postal_code: ''
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Show loading state
        setIsEditing(true);
        
        // Upload image to Supabase storage
        const result = await ProfileService.uploadProfileImage(user.id, file);
        
        if (result.error) {
          alert(`Error uploading image: ${result.error}`);
        } else {
          // Update local state with new image URL
          setProfileImage(result.url);
          setEditedUser(prev => ({ ...prev, avatar_url: result.url }));
          alert('Image uploaded successfully!');
        }
        
        setIsEditing(false);
      } catch (error) {
        console.error('Image upload error:', error);
        alert('Error uploading image. Please try again.');
        setIsEditing(false);
      }
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 transition-colors">
      {/* Mobile Header */}
      <div className="flex items-center md:hidden flex-1 min-w-0">
        <button 
          onClick={onMenuToggle}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <i className="fas fa-bars text-lg"></i>
        </button>
        <div className="ml-3 flex items-center min-w-0 flex-1">
          <img 
            src="https://www.facultyplus.com/wp-content/uploads/2024/04/NEC-Andhra-Prdaesh.png" 
            alt="NEC Logo" 
            className="w-7 h-7 object-contain mr-2 flex-shrink-0 p-[5px] bg-white rounded-lg shadow-lg shadow-slate-900/20"
          />
          <span className="font-bold text-slate-900 dark:text-white text-sm truncate">CollegeFlow</span>
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:flex items-center">
        <img 
          src="https://www.facultyplus.com/wp-content/uploads/2024/04/NEC-Andhra-Prdaesh.png" 
          alt="NEC Logo" 
          className="w-8 h-8 object-contain mr-3 p-[5px] bg-white rounded-lg shadow-lg shadow-slate-900/20"
        />
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role: {user.role}</h2>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
        <button 
          onClick={onToggleDark}
          className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
        </button>

        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <i className="fas fa-bell text-lg"></i>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 sm:right-0 mt-2 w-[calc(70vw)] sm:w-80 sm:max-w-96 max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider">Notifications</h3>
                  <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                          notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                          'bg-indigo-100 text-indigo-600'
                        }`}>
                          <i className={`fas ${
                            notification.type === 'success' ? 'fa-check' :
                            notification.type === 'warning' ? 'fa-exclamation' :
                            'fa-info'
                          } text-[10px] sm:text-xs`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500">
                              {notification.time}
                            </span>
                            <button className="text-[9px] sm:text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                              <span className="hidden sm:inline">Mark as read</span>
                              <span className="sm:hidden">Read</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 sm:p-6 text-center">
                    <i className="fas fa-bell-slash text-xl sm:text-2xl text-slate-300 dark:text-slate-600 mb-2 sm:mb-3"></i>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">No notifications</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 sm:p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <button className="w-full text-center text-xs sm:text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-1 sm:py-2">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl p-2 -m-2 transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm transition-all hover:shadow-lg hover:scale-105">
               <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              {!isEditing ? (
                <>
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white text-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border-4 border-white/30">
                      <img src={profileImage} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <h3 className="text-lg font-black">{user.name}</h3>
                    <p className="text-sm opacity-90">{user.role}</p>
                  </div>

                  {/* Profile Info */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Full Name</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Role</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{user.role}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Department</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Computer Science</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Student ID</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">NEC{user.id.padStart(6, '0')}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-4">
                      <button
                        onClick={handleProfileEdit}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-black rounded-xl transition-all shadow-lg hover:shadow-xl"
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Edit Profile
                      </button>
                      <button 
                        onClick={handleSettings}
                        className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-black rounded-xl transition-all"
                      >
                        <i className="fas fa-cog mr-2"></i>
                        Settings
                      </button>
                      <button 
                        onClick={onLogout}
                        className="w-full py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-black rounded-xl transition-all"
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-wider">Edit Profile</h3>
                      <button
                        onClick={handleCancelEdit}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      {/* Photo Upload */}
                      <div className="text-center">
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Profile Photo</label>
                        <div className="relative inline-block">
                          <img 
                            src={profileImage} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 cursor-pointer transition-transform hover:scale-105"
                            onClick={() => {
                              if (profileImage && profileImage !== `https://picsum.photos/seed/${user.id}/100`) {
                                window.open(profileImage, '_blank');
                              }
                            }}
                          />
                          <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
                            <i className="fas fa-camera text-xs"></i>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Click camera to change photo</p>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editedUser.name}
                          onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
                        <input
                          type="email"
                          value={editedUser.email}
                          onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={editedUser.phone}
                          onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Department</label>
                        <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm">
                          <option>Computer Science</option>
                          <option>Electronics</option>
                          <option>Mechanical</option>
                          <option>Civil</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Bio</label>
                        <textarea
                          value={editedUser.bio}
                          onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={editedUser.date_of_birth}
                          onChange={(e) => setEditedUser({...editedUser, date_of_birth: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                        <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm">
                          <option value="">Select Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
                        <input
                          type="text"
                          value={editedUser.blood_group}
                          onChange={(e) => setEditedUser({...editedUser, blood_group: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="e.g., A+, B+, O-"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Emergency Contact Name</label>
                        <input
                          type="text"
                          value={editedUser.emergency_contact_name}
                          onChange={(e) => setEditedUser({...editedUser, emergency_contact_name: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="Emergency contact person"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Emergency Contact Phone</label>
                        <input
                          type="tel"
                          value={editedUser.emergency_contact_phone}
                          onChange={(e) => setEditedUser({...editedUser, emergency_contact_phone: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="Emergency contact number"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Emergency Contact Relation</label>
                        <input
                          type="text"
                          value={editedUser.emergency_contact_relation}
                          onChange={(e) => setEditedUser({...editedUser, emergency_contact_relation: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="e.g., Parent, Sibling, Spouse"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Address</label>
                        <textarea
                          value={editedUser.address}
                          onChange={(e) => setEditedUser({...editedUser, address: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                          rows={2}
                          placeholder="Your complete address"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">City</label>
                          <input
                            type="text"
                            value={editedUser.city}
                            onChange={(e) => setEditedUser({...editedUser, city: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">State</label>
                          <input
                            type="text"
                            value={editedUser.state}
                            onChange={(e) => setEditedUser({...editedUser, state: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            placeholder="State"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Postal Code</label>
                        <input
                          type="text"
                          value={editedUser.postal_code}
                          onChange={(e) => setEditedUser({...editedUser, postal_code: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="Postal code"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-black rounded-xl transition-all shadow-lg hover:shadow-xl"
                      >
                        <i className="fas fa-save mr-2"></i>
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-black rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="absolute right-0 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[60] max-h-[80vh]" style={{ top: '45px' }} ref={settingsRef}>
          {/* Settings Header */}
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 text-white">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowProfile(true);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
              >
                <i className="fas fa-arrow-left text-white"></i>
              </button>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <i className="fas fa-cog text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-black">Settings</h3>
                <p className="text-sm opacity-90">Manage your account preferences</p>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="overflow-y-auto overflow-x-hidden p-6 space-y-6 settings-scrollbar" style={{ maxHeight: 'calc(80vh - 120px)' }}>
            {/* Appearance Section */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <i className="fas fa-palette text-indigo-600 dark:text-indigo-400 text-sm"></i>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Appearance</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-moon text-slate-400"></i>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark Mode</span>
                  </div>
                  <button
                    onClick={onToggleDark}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-indigo-600 transition-colors"
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bell text-green-600 dark:text-green-400 text-sm"></i>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Notifications</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-envelope text-slate-400"></i>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Notifications</span>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-mobile-alt text-slate-400"></i>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Push Notifications</span>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <i className="fas fa-lock text-purple-600 dark:text-purple-400 text-sm"></i>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Privacy</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-eye text-slate-400"></i>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Visibility</span>
                  </div>
                  <select className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option>Public</option>
                    <option>Private</option>
                    <option>Friends Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Actions Section */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-cog text-red-600 dark:text-red-400 text-sm"></i>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Account</h4>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center space-x-3 p-3 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-all"
                >
                  <i className="fas fa-download text-slate-600 dark:text-slate-400"></i>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Export Data</span>
                </button>
                
                <button 
                  onClick={handleClearCache}
                  className="w-full flex items-center justify-center space-x-3 p-3 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                >
                  <i className="fas fa-exclamation-triangle text-amber-600 dark:text-amber-400"></i>
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Clear Cache</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;
