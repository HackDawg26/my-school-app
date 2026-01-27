import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import axios from 'axios';
import TeacherQuarterlyGrades from './TeacherQuarterlyGrades.tsx';

interface Subject {
  id: number;
  name: string;
  description?: string;
}

export default function QuarterlyGradesPage() {
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      const response = await axios.get('http://127.0.0.1:8000/api/subject-offerings/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSubjectInfo = subjects.find(s => s.id === selectedSubject);

  if (selectedSubject && selectedSubjectInfo) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <button
          onClick={() => setSelectedSubject(null)}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={20} />
          Back to Subjects
        </button>
        <TeacherQuarterlyGrades 
          subjectoffering_id={selectedSubject} 
          subjectName={selectedSubjectInfo.name}
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quarterly Grades Management</h1>
        <p className="text-gray-600">Select a subject to manage quarterly grades</p>
      </div>

      {/* Subject Cards */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No subjects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <BookOpen className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{subject.name}</h3>
              {subject.description && (
                <p className="text-sm text-gray-600">{subject.description}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3">📋 About Quarterly Grades</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• <strong>Written Work (40%):</strong> Homework, seatwork, quizzes</li>
          <li>• <strong>Performance Tasks (40%):</strong> Projects, group work, practical activities</li>
          <li>• <strong>Quarterly Assessment (20%):</strong> Major exams and assessments</li>
          <li>• Final grade is automatically calculated based on these weighted components</li>
          <li>• Each quarter (Q1, Q2, Q3, Q4) is tracked separately</li>
        </ul>
      </div>
    </div>
  );
}
