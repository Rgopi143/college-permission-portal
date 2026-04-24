import React, { useState, useEffect } from 'react';
import { SyllabusMaterial, SyllabusCategory, SyllabusService } from '../services/syllabusService';
import { User } from '../types';

interface SyllabusProps {
  user: User;
}

const Syllabus: React.FC<SyllabusProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'upload' | 'categories'>('list');
  const [activeContainer, setActiveContainer] = useState<string>('all');
  const [materials, setMaterials] = useState<SyllabusMaterial[]>([]);
  const [categories, setCategories] = useState<SyllabusCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    bySubject: {},
    byType: {},
    recent: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state for new material
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    subject: '',
    course_code: '',
    semester: '',
    department: user.department || '',
    material_type: 'PDF' as const,
    is_active: true,
    tags: [] as string[]
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load data on component mount
  useEffect(() => {
    // Restore state from localStorage
    const savedTab = localStorage.getItem('syllabus_activeTab');
    const savedContainer = localStorage.getItem('syllabus_activeContainer');
    const savedSearch = localStorage.getItem('syllabus_searchQuery');
    
    if (savedTab) setActiveTab(savedTab as any);
    if (savedContainer) setActiveContainer(savedContainer);
    if (savedSearch) setSearchQuery(savedSearch);
    
    loadMaterials();
    loadCategories();
    loadStats();
  }, []);

  // Save state and scroll position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('syllabus_activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('syllabus_activeContainer', activeContainer);
  }, [activeContainer]);

  useEffect(() => {
    localStorage.setItem('syllabus_searchQuery', searchQuery);
  }, [searchQuery]);

  // Restore scroll position after component mounts
  useEffect(() => {
    const savedScrollPosition = localStorage.getItem('page_scrollPosition');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition));
    }
  }, []);

  // Save scroll position before component unmounts
  useEffect(() => {
    const handleScroll = () => {
      localStorage.setItem('page_scrollPosition', window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Loading materials for user:', user.id);
      
      // Add test data to verify component works
      const testData: SyllabusMaterial[] = [
        {
          id: '1',
          title: 'Test Material 1',
          description: 'This is a test material',
          subject: 'Computer Science',
          course_code: 'CS101',
          semester: '1st',
          department: user.department || 'CSE',
          material_type: 'PDF',
          uploaded_by: user.id,
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          tags: ['test', 'computer-science']
        },
        {
          id: '2',
          title: 'Test Material 2',
          description: 'Another test material',
          subject: 'Mathematics',
          course_code: 'MATH101',
          semester: '1st',
          department: user.department || 'CSE',
          material_type: 'DOC',
          uploaded_by: user.id,
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          tags: ['test', 'mathematics']
        }
      ];
      
      // Try to load from database first
      const data = await SyllabusService.getSyllabusMaterials(user.id);
      console.log('Materials loaded from DB:', data);
      
      // Use test data if DB is empty, otherwise use DB data
      setMaterials(data.length > 0 ? data : testData);
    } catch (error) {
      console.error('Error loading materials:', error);
      setError('Failed to load syllabus materials');
      
      // Set test data even on error to verify UI works
      const fallbackData: SyllabusMaterial[] = [
        {
          id: '3',
          title: 'Fallback Material',
          description: 'Fallback test material',
          subject: 'Physics',
          course_code: 'PHY101',
          semester: '1st',
          department: user.department || 'CSE',
          material_type: 'PDF',
          uploaded_by: user.id,
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          tags: ['fallback', 'physics']
        }
      ];
      setMaterials(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await SyllabusService.getSyllabusCategories();
      console.log('Categories loaded from DB:', data);
      
      // Add test categories if DB is empty
      if (data.length === 0) {
        const testCategories = [
          {
            id: '1',
            name: 'Academic',
            description: 'Academic materials and resources',
            department: user.department || 'CSE',
            semester: 'All',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Laboratory',
            description: 'Lab manuals and experiments',
            department: user.department || 'CSE',
            semester: 'All',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setCategories(testCategories);
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
      
      // Set fallback categories even on error
      const fallbackCategories = [
        {
          id: '3',
          name: 'General',
          description: 'General category',
          department: user.department || 'CSE',
          semester: 'All',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await SyllabusService.getSyllabusStats();
      console.log('Stats loaded from DB:', data);
      
      // Use test stats if DB returns empty stats
      if (data.total === 0) {
        const testStats = {
          total: 2,
          bySubject: {
            'Computer Science': 1,
            'Mathematics': 1
          },
          byType: {
            'PDF': 1,
            'DOC': 1
          },
          recent: 1
        };
        setStats(testStats);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Failed to load stats');
      
      // Set fallback stats even on error
      const fallbackStats = {
        total: 1,
        bySubject: {
          'Physics': 1
        },
        byType: {
          'PDF': 1
        },
        recent: 0
      };
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDownload = (material: SyllabusMaterial) => {
    if (material.file_url) {
      window.open(material.file_url, '_blank');
    }
  };

  const handleSubmitMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const materialData = {
        ...newMaterial,
        created_by: user.id,
        uploaded_at: new Date().toISOString()
      };
      
      await SyllabusService.uploadSyllabusMaterial(materialData, selectedFile);
      
      // Reset form
      setNewMaterial({
        title: '',
        description: '',
        subject: '',
        course_code: '',
        semester: '',
        department: user.department || '',
        material_type: 'PDF' as const,
        is_active: true,
        tags: [] as string[]
      });
      setSelectedFile(null);
      setShowCreateModal(false);
      
      // Reload materials
      await loadMaterials();
    } catch (error) {
      setError('Failed to create material');
    } finally {
      setLoading(false);
    }
  };

  
  const handleCategoryFilter = async (category: string) => {
    setActiveContainer(category);
    setLoading(true);
    try {
      if (category) {
        const data = await SyllabusService.getSyllabusByDepartment(category);
        setMaterials(data);
      } else {
        loadMaterials();
      }
    } catch (error) {
      setError('Failed to filter materials');
    } finally {
      setLoading(false);
    }
  };

  const getMaterialTypeColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'text-red-600 dark:text-red-400';
      case 'DOC': return 'text-blue-600 dark:text-blue-400';
      case 'PPT': return 'text-orange-600 dark:text-orange-400';
      case 'VIDEO': return 'text-purple-600 dark:text-purple-400';
      case 'IMAGE': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const materialContainers = [
    { id: 'all', name: 'All Materials', icon: 'fa-folder', color: 'bg-blue-500' },
    { id: 'academic', name: 'Academic Materials', icon: 'fa-book', color: 'bg-green-500' },
    { id: 'laboratory', name: 'Laboratory Materials', icon: 'fa-flask', color: 'bg-purple-500' },
    { id: 'assignments', name: 'Assignments', icon: 'fa-tasks', color: 'bg-orange-500' },
    { id: 'notes', name: 'Class Notes', icon: 'fa-sticky-note', color: 'bg-yellow-500' },
    { id: 'references', name: 'References', icon: 'fa-bookmark', color: 'bg-indigo-500' },
    { id: 'past_papers', name: 'Past Papers', icon: 'fa-file-alt', color: 'bg-red-500' },
    { id: 'projects', name: 'Projects', icon: 'fa-project-diagram', color: 'bg-teal-500' }
  ];

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'CSE', name: 'Computer Science Engineering (CSE)' },
    { id: 'AIML', name: 'Artificial Intelligence & Machine Learning (AIML)' },
    { id: 'ECE', name: 'Electronics & Communication Engineering (ECE)' },
    { id: 'MECH', name: 'Mechanical Engineering (MECH)' },
    { id: 'CIVIL', name: 'Civil Engineering (CIVIL)' },
    { id: 'EEE', name: 'Electrical & Electronics Engineering (EEE)' }
  ];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !searchQuery || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.course_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesContainer = activeContainer === 'all' || 
      material.tags.some(tag => tag.toLowerCase().includes(activeContainer.toLowerCase()));
    
    const matchesDepartment = !user.department || user.department === 'GENERAL' || 
      material.department === user.department;
    
    return matchesSearch && matchesContainer && matchesDepartment;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Syllabus Materials</h1>
        <p className="text-slate-600 dark:text-slate-400">Access course materials, syllabus, and study resources</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Materials</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.recent}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Added This Week</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Object.keys(stats.bySubject).length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Subjects</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Object.keys(stats.byType).length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">File Types</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Materials
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'categories'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Categories
        </button>
        {(user.role === 'ADMIN' || user.role === 'HOD') && (
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Upload Material
          </button>
        )}
      </div>

      {/* Create New Button */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {filteredMaterials.length} materials found
        </div>
        {(user.role === 'ADMIN' || user.role === 'HOD' || user.role === 'MENTOR') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Create New Material
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-red-800 dark:text-red-200">{error}</div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && !loading && (
        <div className="space-y-4">
          {/* Material Containers */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Material Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {materialContainers.map((container) => (
                <button
                  key={container.id}
                  onClick={() => setActiveContainer(container.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    activeContainer === container.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className={`w-12 h-12 ${container.color} rounded-lg flex items-center justify-center mb-2 mx-auto`}>
                    <i className={`fas ${container.icon} text-white text-lg`}></i>
                  </div>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
                    {container.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-500 dark:text-slate-400 mb-4">No materials found</div>
              <div className="text-sm text-slate-400 dark:text-slate-600">
                Try adjusting your search or filter criteria
              </div>
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {material.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span className="font-medium">{material.subject}</span>
                      <span>•</span>
                      <span>{material.course_code}</span>
                      <span>•</span>
                      <span>{material.semester}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 line-clamp-2 mb-3">
                      {material.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMaterialTypeColor(material.material_type)}`}>
                        <i className={`fas ${SyllabusService.getFileTypeIcon(material.material_type)} mr-1`}></i>
                        {material.material_type}
                      </span>
                      {material.tags && material.tags.length > 0 && (
                        <div className="flex gap-1">
                          {material.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {material.file_url && (
                      <button
                        onClick={() => handleDownload(material)}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <i className="fas fa-download mr-2"></i>
                        Download
                      </button>
                    )}
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {material.file_name && (
                        <div>{material.file_name}</div>
                      )}
                      {material.file_size && (
                        <div>{SyllabusService.formatFileSize(material.file_size)}</div>
                      )}
                      <div>{new Date(material.uploaded_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {category.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                {category.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  {category.department} • {category.semester}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  category.is_active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (user.role === 'ADMIN' || user.role === 'HOD') && (
        <form onSubmit={handleSubmitMaterial} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Material title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={newMaterial.subject}
                onChange={(e) => setNewMaterial({...newMaterial, subject: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Subject name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Course Code
              </label>
              <input
                type="text"
                value={newMaterial.course_code}
                onChange={(e) => setNewMaterial({...newMaterial, course_code: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Course code (e.g., CS101)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Semester
              </label>
              <input
                type="text"
                value={newMaterial.semester}
                onChange={(e) => setNewMaterial({...newMaterial, semester: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Semester (e.g., Fall 2024)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Material Type
              </label>
              <select
                value={newMaterial.material_type}
                onChange={(e) => setNewMaterial({...newMaterial, material_type: e.target.value as any})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              >
                <option value="PDF">PDF Document</option>
                <option value="DOC">Word Document</option>
                <option value="PPT">PowerPoint</option>
                <option value="VIDEO">Video</option>
                <option value="IMAGE">Image</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Department
              </label>
              <select
                value={newMaterial.department}
                onChange={(e) => setNewMaterial({...newMaterial, department: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={newMaterial.description}
              onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              rows={4}
              placeholder="Detailed description of the material"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              File (Optional)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.jpg,.jpeg,.png"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Selected: {selectedFile.name} ({SyllabusService.formatFileSize(selectedFile.size)})
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={newMaterial.tags.join(', ')}
              onChange={(e) => setNewMaterial({...newMaterial, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="Enter tags separated by commas"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  {/* Create Modal */}
  {showCreateModal && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Material</h2>
          <button
            onClick={() => setShowCreateModal(false)}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmitMaterial} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Material title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={newMaterial.subject}
                onChange={(e) => setNewMaterial({...newMaterial, subject: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Subject name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Course Code
              </label>
              <input
                type="text"
                value={newMaterial.course_code}
                onChange={(e) => setNewMaterial({...newMaterial, course_code: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Course code (e.g., CS101)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Semester
              </label>
              <input
                type="text"
                value={newMaterial.semester}
                onChange={(e) => setNewMaterial({...newMaterial, semester: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Semester (e.g., Fall 2024)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Material Type
              </label>
              <select
                value={newMaterial.material_type}
                onChange={(e) => setNewMaterial({...newMaterial, material_type: e.target.value as any})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              >
                <option value="PDF">PDF Document</option>
                <option value="DOC">Word Document</option>
                <option value="PPT">PowerPoint</option>
                <option value="VIDEO">Video</option>
                <option value="IMAGE">Image</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Department
              </label>
              <select
                value={newMaterial.department}
                onChange={(e) => setNewMaterial({...newMaterial, department: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={newMaterial.description}
              onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              rows={4}
              placeholder="Detailed description of material"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              File (Optional)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.jpg,.jpeg,.png"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Selected: {selectedFile.name} ({SyllabusService.formatFileSize(selectedFile.size)})
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={newMaterial.tags.join(', ')}
              onChange={(e) => setNewMaterial({...newMaterial, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="Enter tags separated by commas (e.g., academic, laboratory, assignments)"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
};

export default Syllabus;
