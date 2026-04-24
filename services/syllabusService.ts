import { supabaseService, SupabaseService } from './supabaseService';

export interface SyllabusMaterial {
  id: string;
  title: string;
  description: string;
  subject: string;
  course_code: string;
  semester: string;
  department: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  material_type: 'PDF' | 'DOC' | 'PPT' | 'VIDEO' | 'IMAGE' | 'OTHER';
  uploaded_by: string;
  uploaded_at: string;
  updated_at: string;
  is_active: boolean;
  tags: string[];
}

export interface SyllabusCategory {
  id: string;
  name: string;
  description: string;
  department: string;
  semester: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class SyllabusService {
  // Get all syllabus materials for a student
  static async getSyllabusMaterials(studentId: string): Promise<SyllabusMaterial[]> {
    try {
      console.log('Supabase client available:', !!SupabaseService.client);
      const { data, error } = await SupabaseService.client
        .from('syllabus_materials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching syllabus materials:', error);
        return [];
      }

      console.log('Raw data from Supabase:', data);
      return data || [];
    } catch (error) {
      console.error('Syllabus fetch error:', error);
      return [];
    }
  }

  // Get syllabus materials by subject
  static async getSyllabusBySubject(subject: string): Promise<SyllabusMaterial[]> {
    try {
      const { data, error } = await SupabaseService.client
        .from('syllabus_materials')
        .select('*')
        .eq('subject', subject)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching syllabus by subject:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Syllabus fetch error:', error);
      return [];
    }
  }

  // Get syllabus materials by department
  static async getSyllabusByDepartment(department: string): Promise<SyllabusMaterial[]> {
    try {
      const { data, error } = await SupabaseService.client
        .from('syllabus_materials')
        .select('*')
        .eq('department', department)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching syllabus by department:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Syllabus fetch error:', error);
      return [];
    }
  }

  // Get syllabus categories
  static async getSyllabusCategories(): Promise<SyllabusCategory[]> {
    try {
      const { data, error } = await SupabaseService.client
        .from('syllabus_categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching syllabus categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Categories fetch error:', error);
      return [];
    }
  }

  // Upload syllabus material
  static async uploadSyllabusMaterial(material: Omit<SyllabusMaterial, 'id' | 'uploaded_at' | 'updated_at'>, file?: File): Promise<{ success: boolean; error?: string; material?: SyllabusMaterial }> {
    try {
      let fileUrl = material.file_url;
      let fileName = material.file_name;
      let fileSize = material.file_size;

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileNameWithExt = `${Date.now()}_syllabus.${fileExt}`;
        const filePath = `syllabus_materials/${fileNameWithExt}`;

        const { data: uploadData, error: uploadError } = await SupabaseService.client.storage
          .from('syllabus_materials')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading syllabus file:', uploadError);
          return { success: false, error: uploadError.message };
        }

        const { data: { publicUrl } } = SupabaseService.client.storage
          .from('syllabus_materials')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = file.name;
        fileSize = file.size;
      }

      const { data, error } = await SupabaseService.client
        .from('syllabus_materials')
        .insert([{
          ...material,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating syllabus material:', error);
        return { success: false, error: error.message };
      }

      return { success: true, material: data };
    } catch (error) {
      console.error('Syllabus upload error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update syllabus material
  static async updateSyllabusMaterial(id: string, updates: Partial<SyllabusMaterial>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await SupabaseService.client
        .from('syllabus_materials')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating syllabus material:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Syllabus update error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete syllabus material
  static async deleteSyllabusMaterial(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get material info to delete file from storage
      const { data: material } = await SupabaseService.client
        .from('syllabus_materials')
        .select('file_url')
        .eq('id', id)
        .single();

      if (material?.file_url) {
        // Extract file path from URL
        const filePath = material.file_url.split('/').pop();
        if (filePath) {
          await SupabaseService.client.storage
            .from('syllabus_materials')
            .remove([`syllabus_materials/${filePath}`]);
        }
      }

      // Delete from database
      const { error } = await SupabaseService.client
        .from('syllabus_materials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting syllabus material:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Syllabus delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search syllabus materials
  static async searchSyllabusMaterials(query: string): Promise<SyllabusMaterial[]> {
    try {
      const { data, error } = await SupabaseService.client
        .from('syllabus_materials')
        .select('*')
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%,course_code.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching syllabus materials:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Syllabus search error:', error);
      return [];
    }
  }

  // Get file type icon
  static getFileTypeIcon(materialType: string): string {
    switch (materialType) {
      case 'PDF': return 'fa-file-pdf';
      case 'DOC': return 'fa-file-word';
      case 'PPT': return 'fa-file-powerpoint';
      case 'VIDEO': return 'fa-file-video';
      case 'IMAGE': return 'fa-file-image';
      default: return 'fa-file';
    }
  }

  // Format file size
  static formatFileSize(bytes?: number): string {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Get syllabus statistics
  static async getSyllabusStats(): Promise<{
    total: number;
    bySubject: Record<string, number>;
    byType: Record<string, number>;
    recent: number;
  }> {
    try {
      const { data, error } = await SupabaseService.client
        .from('syllabus_materials')
        .select('subject, material_type, created_at')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching syllabus stats:', error);
        return { total: 0, bySubject: {}, byType: {}, recent: 0 };
      }

      const bySubject: Record<string, number> = {};
      const byType: Record<string, number> = {};
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      data?.forEach(item => {
        bySubject[item.subject] = (bySubject[item.subject] || 0) + 1;
        byType[item.material_type] = (byType[item.material_type] || 0) + 1;
      });

      const recent = data?.filter(item => new Date(item.created_at) > oneWeekAgo).length || 0;

      return {
        total: data?.length || 0,
        bySubject,
        byType,
        recent
      };
    } catch (error) {
      console.error('Stats fetch error:', error);
      return { total: 0, bySubject: {}, byType: {}, recent: 0 };
    }
  }
}
