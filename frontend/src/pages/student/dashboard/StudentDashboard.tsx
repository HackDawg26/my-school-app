import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Bell, 
  Clock, 
  Search,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

// --- Types ---
interface Task {
  id: number;
  subject: string;
  taskName: string;
  dueDate: string;
  urgency: 'high' | 'medium' | 'low';
}

interface SubjectGrade {
  label: string;
  percentage: number;
}

// --- Mock Data ---
const MOCK_TASKS: Task[] = [
  { id: 1, subject: 'Advanced Calculus', taskName: 'Weekly Quiz', dueDate: 'Today, 11:59 PM', urgency: 'high' },
  { id: 2, subject: 'Quantum Physics', taskName: 'Lab Report', dueDate: 'Tomorrow', urgency: 'medium' },
  { id: 3, subject: 'World History', taskName: 'Research Paper', dueDate: 'In 3 days', urgency: 'low' },
];

const MOCK_GRADES: SubjectGrade[] = [
  { label: 'Math', percentage: 88 },
  { label: 'Physics', percentage: 74 },
  { label: 'Computer Sci', percentage: 95 },
  { label: 'History', percentage: 82 },
  { label: 'Literature', percentage: 91 },
];

const StudentDashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      

      {/* Main Content */}
      <main className="flex-1 p-1 overflow-y-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
            <p className="text-slate-500 font-medium">Hello Alex, you have <span className="text-blue-600">3 tasks</span> requiring attention.</p>
          </div>  
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard label="Current GPA" value="3.88" trend="+0.04" type="up" />
          <StatCard label="Attendance" value="96.2%" trend="Stable" type="neutral" />
          <StatCard label="Completed Tasks" value="24/28" trend="85%" type="up" />

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Grade Analysis Section */}
          <section className="xl:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold">Grade Performance</h2>
                <p className="text-sm text-slate-400">Average score across all current modules</p>
              </div>
              <select className="text-sm font-semibold bg-slate-50 border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 ring-blue-500/20">
                <option>Semester 1, 2024</option>
                <option>Semester 2, 2023</option>
              </select>
            </div>
            
            <div className="flex items-end justify-between h-64 gap-4 md:gap-8 pt-6">
              {MOCK_GRADES.map((grade) => (
                <GradeBar key={grade.label} label={grade.label} percentage={grade.percentage} />
              ))}
            </div>
          </section>

          {/* Pending Activities Section */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Upcoming Deadlines</h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">View All</span>
            </div>
            
            <div className="space-y-4">
              {MOCK_TASKS.map((task) => (
                <div key={task.id} className="group p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{task.subject}</span>
                    <div className={`p-1.5 rounded-lg ${task.urgency === 'high' ? 'bg-red-50 text-red-500' : 'bg-slate-200 text-slate-500'}`}>
                      <Clock size={14} />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{task.taskName}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-[11px] px-3 py-1 rounded-full font-bold ${
                      task.urgency === 'high' ? 'bg-red-500 text-white' : 'bg-white border text-slate-500'
                    }`}>
                      {task.dueDate}
                    </span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---



const StatCard = ({ label, value, trend, type }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
        type === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-50'
      }`}>
        {trend}
      </span>
    </div>
  </div>
);

const GradeBar = ({ label, percentage }: SubjectGrade) => {
  // Logic to change bar color based on performance
  const barColor = percentage > 85 ? 'bg-indigo-500' : percentage > 75 ? 'bg-blue-400' : 'bg-slate-400';
  
  return (
    <div className="flex flex-col items-center flex-1 h-full group">
      <div className="w-full bg-slate-50 rounded-2xl relative h-full flex items-end overflow-hidden border border-slate-100/50">
        <div 
          className={`${barColor} w-full transition-all duration-1000 ease-out rounded-t-xl group-hover:opacity-80`} 
          style={{ height: `${percentage}%` }}
        />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded-md font-bold z-10">
          {percentage}%
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-500 mt-4 text-center whitespace-nowrap">{label}</span>
    </div>
  );
};

export default StudentDashboard;