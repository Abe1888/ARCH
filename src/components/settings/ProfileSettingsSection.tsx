import React, { useState, useRef, useEffect } from 'react';
import { User, Phone, Hash, Building2, Briefcase, Camera, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileSettingsSectionProps {
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({ onNotify }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    phone: '',
    employee_id: '',
    department: '',
    company_name: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('Fetching user profile for user ID:', user.id);

      // Use the same approach as UserIDCard.tsx for consistency
      const { data, error } = await supabase
        .from('user_roles')
        .select();

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Query returned data:', data);

      // Filter the data manually to find the user's record
      const userRecord = data?.find(record => record.user_id === user.id);

      if (userRecord) {
        console.log('User profile found:', userRecord);
        setFormData({
          full_name: userRecord.full_name || '',
          job_title: userRecord.job_title || '',
          phone: userRecord.phone || '',
          employee_id: userRecord.employee_id || '',
          department: userRecord.department || '',
          company_name: userRecord.company_name || '',
        });
        setCurrentAvatarUrl(userRecord.avatar_url);
        setAvatarPreview(userRecord.avatar_url);
      } else {
        console.log('No profile found for user, will create on first save');
        // No profile exists yet - this is okay, it will be created on first save
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      onNotify('Failed to load profile data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onNotify('File size must be less than 5MB', 'error');
        return;
      }

      if (!file.type.startsWith('image/')) {
        onNotify('Please select a valid image file', 'error');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return currentAvatarUrl;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      throw new Error('Failed to upload avatar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    try {
      let avatarUrl = currentAvatarUrl;

      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const updateData = {
        user_id: user.id,
        full_name: formData.full_name || null,
        job_title: formData.job_title || null,
        phone: formData.phone || null,
        employee_id: formData.employee_id || null,
        department: formData.department || null,
        company_name: formData.company_name || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('user_roles')
        .upsert(updateData, {
          onConflict: 'user_id',
        });

      if (updateError) throw updateError;

      setCurrentAvatarUrl(avatarUrl);
      setAvatarFile(null);
      onNotify('Profile updated successfully', 'success');

      await fetchUserProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      onNotify(err instanceof Error ? err.message : 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-200">
        <div className="relative group">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-600 shadow-lg">
              <User className="w-16 h-16 text-blue-600" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
            disabled={isSaving}
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarSelect}
          className="hidden"
        />
        <p className="text-sm text-gray-500 text-center">
          Click the camera icon to upload a profile photo (Max 5MB)
        </p>
        {user?.email && (
          <div className="text-center">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium text-gray-900">{user.email}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Full Name</span>
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter your full name"
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Job Title / Position</span>
          </label>
          <input
            type="text"
            name="job_title"
            value={formData.job_title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., Senior Developer, Project Manager"
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>Phone Number</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="+1 (555) 123-4567"
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Hash className="w-4 h-4 text-blue-600" />
            <span>Employee ID</span>
          </label>
          <input
            type="text"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., EMP-12345"
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Department</span>
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., Engineering, Marketing"
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Company Name</span>
          </label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Your company name"
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        <motion.button
          type="submit"
          disabled={isSaving}
          whileHover={{ scale: isSaving ? 1 : 1.02 }}
          whileTap={{ scale: isSaving ? 1 : 0.98 }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};
