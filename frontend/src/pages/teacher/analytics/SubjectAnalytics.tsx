import React from 'react';
import { BarChart2, Users, Target, Zap, ChevronUp, AlertCircle } from 'lucide-react';

const SubjectAnalytics = () => {
  // Professional Mock Data Structure
  const analyticsData = [
    {
      id: 'math-101',
      subject: 'Mathematics',
      average: 88.5,
      participation: 94,
      trend: '+2.1%',
      highest: 98,
      status: 'On Track',
      scoreDistribution: [4, 8, 12, 5, 1], // [90-100, 80-89, 70-79, 60-69, <60]
    },
    {
      id: 'alg-202',
      subject: 'Algebra',
      average: 82.4,
      participation: 88,
      trend: '-1.4%',
      highest: 95,
      status: 'Needs Review',
      scoreDistribution: [2, 10, 8, 7, 3],
    },
    {
      id: 'geo-303',
      subject: 'Geometry',
      average: 91.2,
      participation: 98,
      trend: '+4.5%',
      highest: 100,
      status: 'Exceling',
      scoreDistribution: [15, 10, 3, 2, 0],
    },
  ];

  return (
    <div className="bg-slate-50/50 min-h-screen p-1 font-sans">
      <div className="max-w-screen mx-auto">
        
        {/* HEADER */}
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Academic Analytics</h1>
          <p className="text-slate-500 text-sm font-medium">Insights across Mathematics, Algebra, and Geometry departments.</p>
        </header>

        {/* OVERALL PERFORMANCE SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Target size={24} /></div>
              <span className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                <ChevronUp size={14} /> 3.2%
              </span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Global Average</p>
            <h3 className="text-3xl font-black text-slate-900">87.3%</h3>
          </div>
          {/* Repeat for other global metrics like Active Students or Total Submissions */}
        </div>

        {/* SUBJECT BREAKDOWN CARDS */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest px-2">Subject Performance</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {analyticsData.map((s) => (
              <div key={s.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 transition-all group">
                <div className="p-8 flex flex-col lg:flex-row gap-8">
                  
                  {/* Subject Info & Primary Score */}
                  <div className="lg:w-1/4 border-r border-slate-100 pr-8">
                    <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded mb-4 inline-block ${
                      s.status === 'Exceling' ? 'bg-emerald-50 text-emerald-600' : 
                      s.status === 'Needs Review' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {s.status}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{s.subject}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900">{s.average}%</span>
                      <span className={`text-xs font-bold ${s.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {s.trend}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-2">Highest Score: {s.highest}%</p>
                  </div>

                  {/* Analytics: Grade Distribution Visualization */}
                  <div className="lg:w-2/4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Grade Distribution</p>
                    <div className="flex items-end gap-2 h-24">
                      {s.scoreDistribution.map((count, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          {/* Simple CSS Bar Chart */}
                          <div 
                            className="w-full bg-slate-100 rounded-t-lg group-hover:bg-indigo-100 transition-all relative overflow-hidden"
                            style={{ height: `${(count / 15) * 100}%` }}
                          >
                            <div className="absolute bottom-0 w-full bg-indigo-500 opacity-20" style={{ height: '100%' }}></div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400">
                            {['A', 'B', 'C', 'D', 'F'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Metrics */}
                  <div className="lg:w-1/4 bg-slate-50/50 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Participation</span>
                        <span className="text-xs font-black text-slate-900">{s.participation}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${s.participation}%` }}></div>
                      </div>
                      <div className="pt-2">
                        <button className="w-full py-2 bg-white border border-slate-200 text-xs font-black text-slate-700 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                          Detailed Subject Report
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectAnalytics;