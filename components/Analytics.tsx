
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
        <h1 className="text-3xl font-bold text-slate-900">Analytics & Trends</h1>
        <p className="text-slate-500 mt-1">Advanced reporting for college management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="font-bold text-slate-900 mb-6">Requests by Branch</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={branchData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="font-bold text-slate-900 mb-6">Request Type Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <h3 className="font-bold text-slate-900 mb-6">KPI Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           <div className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600">88%</p>
              <p className="text-xs font-bold text-slate-500 uppercase mt-2">Approval Rate</p>
           </div>
           <div className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600">1.4h</p>
              <p className="text-xs font-bold text-slate-500 uppercase mt-2">Avg Response Time</p>
           </div>
           <div className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600">12%</p>
              <p className="text-xs font-bold text-slate-500 uppercase mt-2">Denial Rate</p>
           </div>
           <div className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600">45</p>
              <p className="text-xs font-bold text-slate-500 uppercase mt-2">Security Grants</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
