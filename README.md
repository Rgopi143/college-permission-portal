# CollegeFlow

A comprehensive college approval workflow system designed for Narasaraopeta Engineering College that streamlines permission requests, late attendance logging, and multi-level approval processes.

## 🎯 Features

### Core Functionality
- **Multi-Role System**: Student, HOD, Mentor, Admin, and Security roles
- **Permission Requests**: Campus exit and event permission management
- **Late Attendance**: Automated attendance logging with reason tracking
- **Workflow Automation**: Multi-step approval process (Mentor → HOD → Security)
- **Real-time Notifications**: Live status updates and alerts
- **AI-Powered Insights**: Gemini AI integration for trend analysis

### User Interface
- **Premium Design**: Modern gradient-based UI with glassmorphism effects
- **Dark Mode**: Complete dark/light theme support
- **Responsive Layout**: Mobile-first design with collapsible sidebar
- **Interactive Dashboard**: Real-time statistics and analytics
- **Profile Management**: User profile editing with photo upload

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **React 19**: Modern React with hooks and concurrent features
- **Tailwind CSS**: Utility-first styling with custom components
- **Supabase Integration**: Real-time database sync and authentication
- **Vite Build Tool**: Fast development and optimized production builds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Supabase account and project
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd collegeflow---multi-role-approval-system
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**
```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your credentials
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

5. **Open Application**
- Navigate to `http://localhost:5173`
- Login with your credentials

## 🏗️ Project Structure

```
collegeflow---multi-role-approval-system/
├── components/           # React components
│   ├── StudentPortal.tsx     # Student dashboard and requests
│   ├── AdminDashboard.tsx    # Admin analytics and management
│   ├── ApprovalDashboard.tsx # HOD/Mentor approval interface
│   ├── TopBar.tsx           # Header with notifications and profile
│   ├── Sidebar.tsx          # Navigation sidebar
│   └── ...                 # Other UI components
├── services/            # External service integrations
│   ├── supabaseService.ts  # Database operations
│   └── geminiService.ts     # AI analysis service
├── types.ts             # TypeScript type definitions
├── constants.ts         # Application constants and mock data
├── App.tsx             # Main application component
├── index.html           # HTML template
└── README.md           # This file
```

## 👥 User Roles & Permissions

### Student
- Submit permission requests (campus exit, event attendance)
- Log late attendance with detailed reasons
- View personal request history and status
- Track approval workflow progress

### Mentor
- Review and approve/deny student requests
- Add comments and feedback to requests
- Monitor student attendance patterns
- Generate performance insights

### Head of Department (HOD)
- Second-level approval for critical requests
- Manage student records and assignments
- Override mentor decisions when necessary
- Departmental analytics and reporting

### Administrator
- System-wide analytics and insights
- User management and role assignments
- System configuration and settings
- AI-powered trend analysis and reports

### Security
- Final approval checkpoint for campus exit
- Verify student identity and permissions
- Log security incidents and violations
- Campus safety monitoring

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI (Optional)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Application Settings
VITE_APP_NAME=CollegeFlow
VITE_DEV_MODE=true
```

### Supabase Setup
1. Create a new Supabase project
2. Configure authentication providers
3. Set up database tables:
   - `users` (user profiles and roles)
   - `requests` (approval requests and workflow)
   - `audit_logs` (approval history)
4. Configure Row Level Security (RLS) policies
5. Get project URL and anonymous key

## 🎨 Customization

### Theming
- **Color Scheme**: Modify Tailwind CSS configuration in `index.html`
- **Dark Mode**: Automatic system preference detection
- **Custom Gradients**: Update gradient classes in components
- **Typography**: Inter font family with multiple weights

### Component Styling
- **Border Radius**: Consistent `rounded-[2.5rem]` for premium feel
- **Shadows**: Layered shadow system for depth
- **Transitions**: Smooth 300-500ms animations
- **Glassmorphism**: Backdrop blur effects throughout UI

## 📱 Mobile Responsiveness

### Breakpoints
- **Mobile**: < 768px (hidden sidebar, hamburger menu)
- **Tablet**: 768px - 1024px (collapsible sidebar)
- **Desktop**: > 1024px (fixed sidebar, full layout)

### Mobile Features
- **Touch-optimized buttons and interactions**
- **Swipe gestures for sidebar navigation**
- **Responsive typography and spacing**
- **Mobile-first form layouts**

## 🔌 AI Integration

### Gemini AI Features
- **Request Analysis**: Identify common approval patterns
- **Trend Detection**: Spot workflow bottlenecks
- **Insight Generation**: Automated summary reports
- **Predictive Analytics**: Forecast approval timelines

### AI Configuration
```typescript
// services/geminiService.ts
const ai = new GoogleGenAI({ 
  apiKey: process.env.VITE_GEMINI_API_KEY 
});

await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: analysisPrompt,
  config: { thinkingConfig: { thinkingBudget: 0 } }
});
```

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### Environment Setup
1. **Production Variables**: Set all environment variables
2. **Database Migrations**: Run Supabase migrations
3. **Security**: Enable HTTPS and security headers
4. **Performance**: Configure CDN and caching

### Hosting Options
- **Vercel**: Recommended for React applications
- **Netlify**: Static hosting with continuous deployment
- **AWS Amplify**: Full-stack hosting solution
- **Supabase Hosting**: Integrated database and hosting

## 🔧 Development

### Available Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting (configured)
- **TypeScript**: Strict type checking enabled
- **Git Hooks**: Pre-commit quality checks

## 🐛 Troubleshooting

### Common Issues

**API Connection Errors**
```bash
# Check environment variables
echo $VITE_SUPABASE_URL

# Verify Supabase connection
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" $VITE_SUPABASE_URL
```

**Build Errors**
```bash
# Clear dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

**Performance Issues**
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for memory leaks
# Use React DevTools Profiler
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes with proper TypeScript types
4. Test all user roles and workflows
5. Submit pull request with detailed description

### Code Standards
- **TypeScript**: Strict mode, no `any` types
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **Naming**: PascalCase for components, camelCase for variables
- **Comments**: JSDoc for functions, inline for complex logic

## 📄 License

This project is proprietary software developed by:
- **NEC**
- **Narasaraopeta Engineering College**

2026 CollegeFlow. All rights reserved.

## 📞 Support

### Technical Support
- **Email**: support@nec.edu
- **Documentation**: Available in project repository
- **Issues**: Report via project issue tracker

### Business Inquiries
- **Company**: NEC
- **Website**: www.nec.edu
- **Phone**: +91-XXXXXXXXXX

---

**CollegeFlow** - Streamlining college approval workflows for better campus management.
