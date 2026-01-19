import React from 'react';

interface LogEntry {
  timestamp: string;
  teacher: string;
  student: string;
  subject: string;
  activity: string;
  previousGrade: string;
  newGrade: string;
  changeType: 'Update' | 'Create';
}

const GradeLogs = () => {
  const logs: LogEntry[] = [
    {
      timestamp: "2023-10-27 10:05:12",
      teacher: "Pedro Garcia",
      student: "Juan dela Cruz",
      subject: "Mathematics",
      activity: "Quiz 1",
      previousGrade: "18/20",
      newGrade: "19/20",
      changeType: "Update",
    },
    {
      timestamp: "2023-10-27 09:45:33",
      teacher: "Maria Santos",
      student: "Maria Clara",
      subject: "English",
      activity: "Essay 1",
      previousGrade: "N/A",
      newGrade: "88/100",
      changeType: "Create",
    },
    {
      timestamp: "2023-10-26 15:20:01",
      teacher: "Ana Cruz",
      student: "Jose Rizal",
      subject: "Science",
      activity: "Lab Report 2",
      previousGrade: "45/50",
      newGrade: "48/50",
      changeType: "Update",
    },
    {
      timestamp: "2023-10-26 14:10:55",
      teacher: "Pedro Garcia",
      student: "Andres Bonifacio",
      subject: "Mathematics",
      activity: "Quiz 1",
      previousGrade: "N/A",
      newGrade: "15/20",
      changeType: "Create",
    },
    {
      timestamp: "2023-10-25 11:30:47",
      teacher: "Juan Reyes",
      student: "Emilio Aguinaldo",
      subject: "Filipino",
      activity: "Pagsusulit 1",
      previousGrade: "22/25",
      newGrade: "20/25",
      changeType: "Update",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-1 font-sans">
      <div className="max-w-screen mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-1">Grade Change Logs</h1>
          <p className="text-slate-500">A record of all grade modifications made by teachers.</p>
        </header>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">Timestamp</th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">Teacher</th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">Student</th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">Subject</th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">Activity</th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">Previous Grade</th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">New Grade</th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">Change Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                      {log.teacher}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.student}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.activity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {log.previousGrade}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {log.newGrade}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        log.changeType === 'Update' 
                          ? 'bg-amber-100 text-amber-600' 
                          : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {log.changeType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeLogs;