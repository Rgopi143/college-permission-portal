import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Footer from './Footer';
import { supabaseService } from '../services/supabaseService';

interface CreateAccountProps {
  onAccountCreated: (user: User) => void;
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
}

const CreateAccount: React.FC<CreateAccountProps> = ({ onAccountCreated, onBack, isDarkMode, onToggleDark }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STUDENT' as UserRole,
    rollNo: '',
    branch: 'Computer Science',
    year: '1st Year',
    password: '',
    confirmPassword: '',
    // Student specific fields
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) newErrors.push('Name is required');
    if (!formData.email.trim()) newErrors.push('Email is required');
    if (!formData.email.includes('@')) newErrors.push('Valid email is required');
    if (!formData.rollNo.trim()) newErrors.push('Roll Number is required');
    if (!formData.password.trim()) newErrors.push('Password is required');
    if (formData.password.length < 6) newErrors.push('Password must be at least 6 characters');
    if (formData.password !== formData.confirmPassword) newErrors.push('Passwords do not match');

    // Student-specific validations
    if (formData.role === UserRole.STUDENT) {
      if (!formData.phone.trim()) newErrors.push('Phone number is required');
      if (!formData.dateOfBirth) newErrors.push('Date of birth is required');
      if (!formData.gender) newErrors.push('Gender is required');
      if (!formData.address.trim()) newErrors.push('Address is required');
      if (!formData.city.trim()) newErrors.push('City is required');
      if (!formData.state.trim()) newErrors.push('State is required');
      if (!formData.postalCode.trim()) newErrors.push('Postal code is required');
      if (!formData.emergencyContactName.trim()) newErrors.push('Emergency contact name is required');
      if (!formData.emergencyContactPhone.trim()) newErrors.push('Emergency contact phone is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (!supabaseService.isAvailable()) {
        setErrors(['Database connection not available. Please try again later.']);
        return;
      }

      // Create user object for database
      const newUser: User = {
        id: formData.rollNo,
        studentId: formData.rollNo,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        branch: formData.branch,
        year: formData.year,
        password_hash: formData.password,
        // Add student-specific fields if role is student
        ...(formData.role === UserRole.STUDENT && {
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          blood_group: formData.bloodGroup,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          emergency_contact_name: formData.emergencyContactName,
          emergency_contact_phone: formData.emergencyContactPhone,
          emergency_contact_relation: formData.emergencyContactRelation
        })
      };

      // Save user to database
      await supabaseService.upsertUser(newUser);
      
      onAccountCreated(newUser);
    } catch (error) {
      console.error('Account creation error:', error);
      setErrors(['Failed to create account. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#e4ebf5] dark:bg-[#0f1219] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-colors duration-300">
      {/* Ambient background depth blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>

      <div className="flex-1 flex items-center justify-center my-4 sm:my-8">
        <div className="w-full max-w-4xl lg:max-w-5xl flex flex-col gap-6 relative z-10">
          <div className="neu-card p-6 sm:p-10 md:p-12 animate-fade-in relative">
            {/* Header with Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={onBack}
                className="neu-icon-btn text-xs font-bold"
                title="Back to Login"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <button 
                onClick={onToggleDark}
                className="neu-icon-btn"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <i className={`fas ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-400'}`}></i>
              </button>
            </div>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-inset-sm text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-3">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Narasaraopeta Engineering College
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                Create Account
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Join the official CollegeFlow campus permission and clearance portal.
              </p>
            </div>

            {errors.length > 0 && (
              <div className="mb-6 p-4 neu-inset text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl space-y-1">
                {errors.map((error, index) => (
                  <p key={index} className="flex items-center">
                    <i className="fas fa-exclamation-circle mr-2 flex-shrink-0"></i>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Core Account Credentials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="neu-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="neu-input"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="neu-select"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="HOD">HOD</option>
                    <option value="SECURITY">Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                    Roll Number / ID
                  </label>
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                    className="neu-input"
                    placeholder="e.g., 23471A4201"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                    Branch
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="neu-select"
                  >
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Electronics">Electronics & Communication</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                    <option value="Civil">Civil Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                    Year of Study
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="neu-select"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="neu-input"
                    placeholder="Create a strong password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="neu-input"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              {/* Student Specific Fields */}
              {formData.role === UserRole.STUDENT && (
                <div className="border-t border-slate-300/40 dark:border-slate-800/80 pt-6 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs">
                      Student Profile Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="neu-input"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="neu-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="neu-select"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                        Blood Group
                      </label>
                      <input
                        type="text"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="neu-input"
                        placeholder="e.g., A+, B+, O-, AB+"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                        Permanent Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="neu-textarea"
                        rows={2}
                        placeholder="Enter your complete home address"
                        required
                      />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="neu-input"
                          placeholder="City"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="neu-input"
                          placeholder="State"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                          PIN / Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className="neu-input"
                          placeholder="522601"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Sub-section */}
                  <div className="border-t border-slate-300/40 dark:border-slate-800/80 pt-6">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="w-1.5 h-5 bg-purple-500 rounded-full"></span>
                      <h3 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs">
                        Emergency Contact (Parent / Guardian)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleInputChange}
                          className="neu-input"
                          placeholder="Parent/Guardian name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleInputChange}
                          className="neu-input"
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">
                          Relationship
                        </label>
                        <input
                          type="text"
                          name="emergencyContactRelation"
                          value={formData.emergencyContactRelation}
                          onChange={handleInputChange}
                          className="neu-input"
                          placeholder="e.g., Parent, Sibling"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full neu-btn-primary py-4 text-sm font-black uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      <span>Registering Account...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus mr-2"></i>
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateAccount;

