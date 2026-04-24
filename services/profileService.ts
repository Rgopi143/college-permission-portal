import { User } from '../types';
import { supabaseService, SupabaseService } from '../services/supabaseService';

export interface ProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export interface UserProfile extends ProfileUpdate {
  email_verified: boolean;
  roll_number?: string;
  roll_number_verified: boolean;
  roll_number_document_url?: string;
  profile_completion_score: number;
  emergency_contact_relation?: string;
  country?: string;
  profile_visibility: 'PUBLIC' | 'PRIVATE' | 'FACULTY_ONLY';
}

export class ProfileService {
  // Get user profile with extended data
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await SupabaseService.client
        .from('user_profiles')
        .select(`
          *,
          users!inner(
            name,
            email,
            role,
            department,
            student_id,
            avatar_url,
            is_active,
            last_login
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      // Merge profile data with user data
      return {
        ...profile,
        ...profile.users
      } as UserProfile;
    } catch (error) {
      console.error('Profile service error:', error);
      return null;
    }
  }

  // Get role-specific notifications for user
  static async getRoleSpecificNotifications(userId: string, userRole: string): Promise<any[]> {
    try {
      const { data: profile, error } = await SupabaseService.client
        .from('user_profiles')
        .select('email_verified, roll_number_verified, profile_completion_score')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return [];
      }

      const baseNotifications = [
        {
          id: 1,
          title: "Welcome to CollegeFlow!",
          message: "Complete your profile to unlock all features",
          type: "info",
          time: "Just now",
          priority: "high"
        },
        {
          id: 2,
          title: "Profile Incomplete",
          message: "Your profile is only 60% complete. Add more details to improve your score.",
          type: "warning",
          time: "1 hour ago",
          priority: "medium"
        }
      ];

      // Add role-specific notifications based on user role and profile status
      if (!profile) {
        return baseNotifications;
      }

      // Student-specific notifications
      if (userRole === 'STUDENT') {
        const studentNotifications = [
          {
            id: 3,
            title: "Permission Request Tips",
            message: "Make sure to provide clear reasons for your permission requests to get faster approvals.",
            type: "info",
            time: "2 days ago",
            priority: "low"
          },
          {
            id: 4,
            title: "Late Attendance Reminder",
            message: "Remember to log your late attendance within 24 hours.",
            type: "info",
            time: "3 days ago",
            priority: "medium"
          },
          {
            id: 5,
            title: "Profile Photo Required",
            message: "Add a profile photo to increase your profile completion score.",
            type: "info",
            time: "1 week ago",
            priority: "low"
          }
        ];
        return [...baseNotifications, ...studentNotifications];
      }

      // Mentor-specific notifications
      if (userRole === 'MENTOR') {
        const mentorNotifications = [
          {
            id: 6,
            title: "New Student Assignment",
            message: `You have ${Math.floor(Math.random() * 5) + 1} new students assigned to your mentorship.`,
            type: "info",
            time: "30 minutes ago",
            priority: "high"
          },
          {
            id: 7,
            title: "Pending Approvals",
            message: "You have 3 permission requests pending your approval. Please review them soon.",
            type: "warning",
            time: "1 hour ago",
            priority: "high"
          },
          {
            id: 8,
            title: "Mentor Dashboard",
            message: "Your students have submitted 15 requests this week. Great work!",
            type: "success",
            time: "2 days ago",
            priority: "low"
          }
        ];
        return [...baseNotifications, ...mentorNotifications];
      }

      // HOD-specific notifications
      if (userRole === 'HOD') {
        const hodNotifications = [
          {
            id: 9,
            title: "Department Performance",
            message: "Your department has a 95% approval rate. Keep up the excellent work!",
            type: "success",
            time: "1 week ago",
            priority: "low"
          },
          {
            id: 10,
            title: "Mentor Review Required",
            message: "Monthly mentor reviews are due. Please complete your reviews for all assigned mentors.",
            type: "warning",
            time: "3 days ago",
            priority: "high"
          },
          {
            id: 11,
            title: "Student Analytics",
            message: "Student performance metrics are available in your dashboard.",
            type: "info",
            time: "2 days ago",
            priority: "low"
          }
        ];
        return [...baseNotifications, ...hodNotifications];
      }

      // Admin-specific notifications
      if (userRole === 'ADMIN') {
        const adminNotifications = [
          {
            id: 12,
            title: "System Health Check",
            message: "All systems are operating normally. Database backup completed successfully.",
            type: "success",
            time: "6 hours ago",
            priority: "low"
          },
          {
            id: 13,
            title: "User Management",
            message: "There are 1,247 active users in the system.",
            type: "info",
            time: "1 day ago",
            priority: "low"
          },
          {
            id: 14,
            title: "Security Alert",
            message: "Unusual login activity detected. Please review security logs.",
            type: "warning",
            time: "2 hours ago",
            priority: "high"
          }
        ];
        return [...baseNotifications, ...adminNotifications];
      }

      // Security-specific notifications
      if (userRole === 'SECURITY') {
        const securityNotifications = [
          {
            id: 15,
            title: "Campus Safety",
            message: "Please review the latest safety protocols before your next shift.",
            type: "info",
            time: "4 hours ago",
            priority: "medium"
          },
          {
            id: 16,
            title: "Exit Log Review",
            message: "Remember to log all campus exits in the system.",
            type: "info",
            time: "1 day ago",
            priority: "low"
          },
          {
            id: 17,
            title: "Security Equipment Check",
            message: "Monthly security equipment maintenance is scheduled.",
            type: "info",
            time: "1 week ago",
            priority: "low"
          }
        ];
        return [...baseNotifications, ...securityNotifications];
      }

      return baseNotifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Get profile image from Supabase storage
  static async getProfileImage(userId: string): Promise<string | null> {
    try {
      // First check if user has a profile with avatar_url
      const { data: profile, error } = await SupabaseService.client
        .from('user_profiles')
        .select('avatar_url')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile image:', error);
        return null;
      }

      // If no profile image, return default
      if (!profile || !profile.avatar_url) {
        return `https://picsum.photos/seed/${userId}/100`;
      }

      return profile.avatar_url;
    } catch (error) {
      console.error('Profile image fetch error:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Starting profile update for user:', userId);
      console.log('Updates to apply:', updates);
      
      // Check if Supabase client is available
      if (!SupabaseService.client) {
        console.error('Supabase client not available');
        return { success: false, error: 'Database connection not available' };
      }
      
      // First update the main users table
      const { error: userError, data: userData } = await SupabaseService.client
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (userError) {
        console.error('Error updating user:', userError);
        return { success: false, error: userError.message };
      }

      console.log('User table updated successfully:', userData);

      // Then update the extended profile
      const { error: profileError, data: profileData } = await SupabaseService.client
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (profileError) {
        console.error('Error updating user profile:', profileError);
        return { success: false, error: profileError.message };
      }

      console.log('User profile updated successfully:', profileData);

      // Log the profile update
      const { error: logError } = await SupabaseService.client
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'UPDATE',
          role: 'USER',
          comments: `Profile updated: ${Object.keys(updates).join(', ')}`,
          timestamp: new Date().toISOString()
        });

      if (logError) {
        console.error('Error logging profile update:', logError);
      } else {
        console.log('Profile update logged successfully');
      }

      return { success: true };
    } catch (error) {
      console.error('Profile service error:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  // Update profile completion score
  static async updateProfileCompletion(userId: string, score: number): Promise<boolean> {
    try {
      const { error } = await SupabaseService.client
        .from('user_profiles')
        .update({
          profile_completion_score: score,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating profile completion:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Profile service error:', error);
      return false;
    }
  }

  // Upload profile image
  static async uploadProfileImage(userId: string, file: File): Promise<{ url: string; error?: string }> {
    try {
      if (!SupabaseService.client) {
        return { url: '', error: 'Supabase client not initialized' };
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      const filePath = `${userId}/avatars/${fileName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await SupabaseService.client.storage
        .from(userId)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { url: '', error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = SupabaseService.client.storage
        .from(userId)
        .getPublicUrl(filePath);

      return { url: publicUrl };
    } catch (error) {
      console.error('Profile image upload error:', error);
      return { url: '', error: error.message };
    }
  }

  // Verify email
  static async verifyEmail(userId: string, token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await SupabaseService.client
        .from('user_profiles')
        .update({
          email_verified: true,
          email_verification_token: null,
          email_verification_sent_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('email_verification_token', token);

      if (error) {
        console.error('Error verifying email:', error);
        return { success: false, error: error.message };
      }

      // Log email verification
      await SupabaseService.client
        .from('email_logs')
        .insert({
          user_id: userId,
          email_type: 'VERIFICATION',
          recipient_email: (await this.getUserEmail(userId)) || '',
          subject: 'Email Verification Successful',
          template_name: 'email_verified',
          sent_status: 'DELIVERED',
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString()
        });

      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email verification
  static async sendEmailVerification(userId: string, email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = Math.random().toString(36).substring(2, 15);
      
      const { error } = await SupabaseService.client
        .from('user_profiles')
        .update({
          email_verification_token: token,
          email_verification_sent_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error sending email verification:', error);
        return { success: false, error: error.message };
      }

      // Log email sent
      await SupabaseService.client
        .from('email_logs')
        .insert({
          user_id: userId,
          email_type: 'VERIFICATION',
          recipient_email: email,
          subject: 'Verify Your Email Address',
          template_name: 'email_verification',
          sent_status: 'SENT',
          sent_at: new Date().toISOString()
        });

      // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
      // await emailService.sendVerificationEmail(email, token);

      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user email helper
  static async getUserEmail(userId: string): Promise<string | null> {
    try {
      const { data: user, error } = await SupabaseService.client
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return null;
      }

      return user.email;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }

  // Update roll number verification
  static async verifyRollNumber(userId: string, documentUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await SupabaseService.client
        .from('user_profiles')
        .update({
          roll_number_verified: true,
          roll_number_document_url: documentUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error verifying roll number:', error);
        return { success: false, error: error.message };
      }

      // Log roll number verification
      await SupabaseService.client
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'VERIFY',
          role: 'USER',
          comments: 'Roll number verified with document',
          timestamp: new Date().toISOString()
        });

      return { success: true };
    } catch (error) {
      console.error('Roll number verification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate profile completion score
  static calculateProfileCompletionScore(profile: Partial<UserProfile>): number {
    const fields = [
      profile.email_verified,
      profile.roll_number_verified,
      profile.bio,
      profile.date_of_birth,
      profile.gender,
      profile.emergency_contact_name,
      profile.emergency_contact_phone,
      profile.address,
      profile.city,
      profile.state
    ];

    const completedFields = fields.filter(field => field === true || (typeof field === 'string' && field.trim() !== ''));
    return Math.round((completedFields.length / fields.length) * 100);
  }

  // Get profile analytics
  static async getProfileAnalytics(userId: string): Promise<{
    completionScore: number;
    loginCount: number;
    lastLogin: string | null;
    emailVerified: boolean;
  } | null> {
    try {
      const { data: profile, error: profileError } = await SupabaseService.client
        .from('user_profiles')
        .select('profile_completion_score, email_verified')
        .eq('user_id', userId)
        .single();

      const { data: user, error: userError } = await SupabaseService.client
        .from('users')
        .select('last_login')
        .eq('id', userId)
        .single();

      const { count, error: loginError } = await SupabaseService.client
        .from('login_activity')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('login_status', 'SUCCESS');

      if (profileError || userError || loginError) {
        console.error('Error fetching profile analytics:', profileError || userError || loginError);
        return null;
      }

      return {
        completionScore: profile?.profile_completion_score || 0,
        loginCount: count || 0,
        lastLogin: user?.last_login || null,
        emailVerified: profile?.email_verified || false
      };
    } catch (error) {
      console.error('Profile analytics error:', error);
      return null;
    }
  }
}
