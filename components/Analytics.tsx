
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// Fixed: Imported BRANCHES from the correct location (constants.ts)
import { WorkflowRequest, RequestType } from '../types';
import { BRANCHES } from '../constants';

interface AnalyticsProps {
  requests: WorkflowRequest[];
}

const Analytics: React.FC<AnalyticsProps> = ({ requests }) => {
  const branchData = BRANCHES.map(branch => ({
    name: branch.split(' ')[0],
    count: requests.filter(r => r.branch === branch).length
  }));

  const typeData = [
    { name: 'Permission', value: requests.filter(r => r.type === RequestType.PERMISSION).length },
    { name: 'Late Attend.', value: requests.filter(r => r.type === RequestType.LATE_ATTENDANCE).length }
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Analytics & Trends</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Advanced reporting and operational intelligence for college management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="neu-card p-6 md:p-8 h-[400px]">
          <h3 className="font-extrabold text-slate-800 dark:text-white mb-6 text-sm uppercase tracking-wider">Requests by Branch</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={branchData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} contentStyle={{ borderRadius: '16px', background: 'var(--neu-surface)', border: '1px solid var(--neu-border-highlight)', boxShadow: 'var(--shadow-neu-flat)' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="neu-card p-6 md:p-8 h-[400px]">
          <h3 className="font-extrabold text-slate-800 dark:text-white mb-6 text-sm uppercase tracking-wider">Request Type Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={6}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '16px', background: 'var(--neu-surface)', border: '1px solid var(--neu-border-highlight)', boxShadow: 'var(--shadow-neu-flat)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="neu-card p-6 md:p-8 overflow-hidden">
        <h3 className="font-extrabold text-slate-800 dark:text-white mb-6 text-sm uppercase tracking-wider">KPI Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <div className="neu-inset-sm p-5 rounded-2xl text-center">
              <p className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400">88%</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Approval Rate</p>
           </div>
           <div className="neu-inset-sm p-5 rounded-2xl text-center">
              <p className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400">1.4h</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Avg Response</p>
           </div>
           <div className="neu-inset-sm p-5 rounded-2xl text-center">
              <p className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400">12%</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Denial Rate</p>
           </div>
           <div className="neu-inset-sm p-5 rounded-2xl text-center">
              <p className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400">45</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Security Passes</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
