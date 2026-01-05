import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { 
  Plus, BookOpen, FileQuestion, GraduationCap, 
  Calendar, Trash2, ChevronDown, PenTool, CheckSquare, FileText, 
  ChevronLeftIcon, type LucideIcon
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

// --- Interfaces ---

type ActivityType = 'Assignment' | 'Quiz' | 'Exam';

interface Activity {
  id: number;
  title: string;
  type: ActivityType;
  date: string;
  description: string;
}

interface ActivityMenuItem {
  label: ActivityType;
  to: string;
  icon: LucideIcon;
}

// --- Component ---

export default function ActivityPage() {
  const { id: subjectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, title: 'Chapter 1 Quiz', type: 'Quiz', date: '2024-05-20', description: 'Covers basics of Algebra' },
  ]);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Omit<Activity, 'id'>>({ 
    title: '', 
    type: 'Assignment', 
    date: '', 
    description: '' 
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const newActivity: Activity = { ...formData, id: Date.now() };
    setActivities([newActivity, ...activities]);
    setShowForm(false);
    setFormData({ title: '', type: 'Assignment', date: '', description: '' });
  };

  const deleteActivity = (id: number) => {
    setActivities(activities.filter(act => act.id !== id));
  };

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'Quiz': return <FileQuestion className="text-orange-500" />;
      case 'Exam': return <GraduationCap className="text-red-500" />;
      default: return <BookOpen className="text-blue-500" />;
    }
  };

  const activityMenuItems: ActivityMenuItem[] = [
    { label: 'Assignment', to: `/subject/${subjectId}/assignment`, icon: PenTool },
    { label: 'Quiz', to: `/subject/${subjectId}/quiz`, icon: CheckSquare },
    { label: 'Exam', to: `/subject/${subjectId}/exam`, icon: FileText },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group mt-2 p-2 flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            >
              <ChevronLeftIcon size={24} className="transition-transform group-hover:-translate-x-1" />
            </button>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Class Activities
              </h1>
              <p className="mt-1 text-gray-500 font-medium">
                Manage assignments, quizzes, and exams for this section
              </p>
            </div>
          </div>

          <div className="relative flex gap-2">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
                <Plus size={18} className="mr-2" />
                Create Activity
                <ChevronDown size={16} className={`ml-2 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                    {activityMenuItems.map(item => (
                        <Link
                            key={item.label}
                            to={item.to}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                            <item.icon size={18} className="mr-3 text-blue-500" />
                            {item.label}
                        </Link>
                    ))}
                    <button 
                      onClick={() => { setShowForm(true); setIsDropdownOpen(false); }}
                      className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-t"
                    >
                      <Plus size={18} className="mr-3 text-gray-400" />
                      Custom Activity
                    </button>
                </div>
            )}
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">New Activity</h2>
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                  <input 
                    required
                    className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none border transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Midterm Project"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
                    <select 
                      className="w-full border-gray-200 rounded-xl p-3 border outline-none"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as ActivityType})}
                    >
                      <option value="Assignment">Assignment</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Exam">Exam</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                    <input 
                      type="date"
                      required
                      className="w-full border-gray-200 rounded-xl p-3 border outline-none"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea 
                    className="w-full border-gray-200 rounded-xl p-3 h-28 border outline-none resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Briefly describe the task requirements..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.length > 0 ? activities.map((activity) => (
            <div key={activity.id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                  {getIcon(activity.type)}
                </div>
                <button 
                  onClick={() => deleteActivity(activity.id)} 
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <h3 className="font-bold text-gray-900 text-xl mb-2">{activity.title}</h3>
              
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                activity.type === 'Exam' ? 'bg-rose-100 text-rose-700' : 
                activity.type === 'Quiz' ? 'bg-amber-100 text-amber-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {activity.type}
              </span>
              
              <p className="text-gray-500 text-sm mt-4 leading-relaxed line-clamp-3">
                {activity.description}
              </p>
              
              <div className="flex items-center gap-2 mt-6 pt-5 border-t border-gray-50 text-gray-500 text-sm font-medium">
                <Calendar size={16} className="text-gray-400" />
                <span>Due: {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-32 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                <BookOpen size={48} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No activities yet</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-2">Get started by creating your first assignment or quiz for this class.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="mt-6 text-blue-600 font-bold hover:text-blue-700"
              >
                + Add Custom Activity
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}