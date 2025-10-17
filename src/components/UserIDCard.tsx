import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Hash, Minimize2, Maximize2, Building2, QrCode, Edit3, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProfileEditModal } from './ProfileEditModal';
import { useLocation } from 'react-router-dom';

interface Position {
  x: number;
  y: number;
}

interface UserProfile {
  full_name: string | null;
  job_title: string | null;
  avatar_url: string | null;
  phone: string | null;
  employee_id: string | null;
  department: string | null;
  company_name: string | null;
  company_logo: string | null;
}

export const UserIDCard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('userCardPosition');
    return saved ? JSON.parse(saved) : { x: 20, y: 80 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    full_name: null,
    job_title: null,
    avatar_url: null,
    phone: null,
    employee_id: null,
    department: null,
    company_name: null,
    company_logo: null,
  });
  const cardRef = useRef<HTMLDivElement>(null);

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      console.log('Fetching user profile for ID:', userId);
      
      // Using the most basic query structure possible
      const { data, error } = await supabase
        .from('user_roles')
        .select();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      // Filter the data manually
      const userRecord = data?.find(record => record.user_id === userId);
      
      if (userRecord) {
        console.log('User profile data fetched successfully:', userRecord);
        setUserProfile({
          full_name: userRecord.full_name || null,
          job_title: userRecord.job_title || null,
          avatar_url: userRecord.avatar_url || null,
          phone: userRecord.phone || null,
          employee_id: userRecord.employee_id || null,
          department: userRecord.department || null,
          company_name: userRecord.company_name || null,
          company_logo: userRecord.company_logo || null,
        });
      }
    } catch (err) {
      console.error('Exception fetching user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile data when component mounts or user changes
  useEffect(() => {
    if (!user) return;
    
    // Fetch profile data immediately on mount
    fetchUserProfile(user.id);
    
    // Set up an interval to periodically refresh the profile data
    const intervalId = setInterval(() => {
      if (user) {
        fetchUserProfile(user.id);
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  // Refresh profile data when navigation changes
  useEffect(() => {
    if (!user) return;
    
    // Fetch profile data on every navigation change
    fetchUserProfile(user.id);
  }, [location.pathname, user]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    console.log('Profile update triggered, refreshing user data');
    // Use the fetchUserProfile function to refresh the data
    await fetchUserProfile(user.id);
    
    // Show a success message or update UI state if needed
    setIsLoading(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    const maxX = window.innerWidth - (cardRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (cardRef.current?.offsetHeight || 0);

    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('userCardPosition', JSON.stringify(position));
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!user) return null;

  // Prepare user data even while loading to prevent layout shifts
  const displayName = userProfile.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || 'N/A';
  const userPhone = userProfile.phone || 'N/A';
  const employeeId = userProfile.employee_id || user.id.slice(0, 12);
  const department = userProfile.department || 'General';
  const companyName = userProfile.company_name || 'Document Library System';
  const avatarUrl = userProfile.avatar_url;
  const companyLogo = userProfile.company_logo;

  const qrCodeData = `USER:${user.id}|EMAIL:${userEmail}|NAME:${displayName}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrCodeData)}`;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.9 : 1, scale: 1 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
      className={`select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`
          bg-white border-2 border-gray-200 rounded-xl shadow-2xl
          transition-all duration-300 ease-in-out
          hover:shadow-3xl
          ${isMinimized ? 'w-16 h-16' : 'w-[320px]'}
          overflow-hidden
        `}
      >
        {isMinimized ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-600 to-blue-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Maximize2 className="w-6 h-6 text-white" />
            </button>
          </div>
        ) : (
          <>
            <div className="relative h-[400px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
              {isLoading && (
                <div className="absolute inset-0 bg-blue-900/50 flex items-center justify-center z-20">
                  <div className="bg-white p-3 rounded-full">
                    <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Edit Profile"
                >
                  <Edit3 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(true);
                  }}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="absolute left-0 top-0 bottom-0 w-12 bg-blue-900/40 flex items-center justify-center">
                <div className="transform -rotate-90 whitespace-nowrap">
                  <span className="text-white font-bold text-xs tracking-[0.3em] uppercase">
                    {department}
                  </span>
                </div>
              </div>

              <div className="pt-6 px-4 flex flex-col items-center">
                <div className="mb-3">
                  {companyLogo ? (
                    <img
                      src={companyLogo}
                      alt={companyName}
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-8 h-8 text-white" />
                      <span className="text-white font-bold text-sm">{companyName.split(' ')[0]}</span>
                    </div>
                  )}
                </div>

                <div className="text-center mb-1">
                  <h2 className="text-white text-xs font-medium tracking-wider uppercase">
                    {companyName}
                  </h2>
                </div>

                <div className="relative mb-4 mt-2">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-14 h-14 text-blue-600" />
                    </div>
                  )}
                </div>

                <div className="text-center mb-3">
                  <h1 className="text-white text-xl font-bold">
                    {displayName}
                  </h1>
                </div>

                <div className="w-full bg-white rounded-lg p-2 shadow-lg space-y-2.5">
                  <div className="flex items-start space-x-2.5">
                    <Hash className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                        ID
                      </p>
                      <p className="text-xs text-gray-900 font-semibold truncate">
                        {employeeId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                        Email
                      </p>
                      <p className="text-xs text-gray-900 font-semibold truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <Phone className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                        Phone
                      </p>
                      <p className="text-xs text-gray-900 font-semibold">
                        {userPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t-2 border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">
                  Scan to Verify
                </span>
              </div>
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-16 h-16 rounded border-2 border-gray-300 bg-white"
              />
            </div>
          </>
        )}
      </div>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={userProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </motion.div>
  );
};
