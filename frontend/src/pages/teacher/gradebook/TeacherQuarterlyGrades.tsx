import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, Plus, Edit2, Trash2, BookOpen, X } from 'lucide-react';

interface Student {
  id: number;
  student_id: string;
  name: string;
}

interface QuarterlyGrade {
  id?: number;
  student: number;
  student_id?: string;
  student_name?: string;
  subject: number;
  quarter: string;
  written_work_score: number;
  written_work_total: number;
  performance_task_score: number;
  performance_task_total: number;
  quarterly_assessment_score: number;
  quarterly_assessment_total: number;
  ww_weight: number;
  pt_weight: number;
  qa_weight: number;
  final_grade?: number;
  remarks: string;
}

interface TeacherQuarterlyGradesProps {
  subjectId: number;
  subjectName: string;
}

export default function TeacherQuarterlyGrades({ subjectId, subjectName }: TeacherQuarterlyGradesProps) {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<QuarterlyGrade[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q1');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<QuarterlyGrade | null>(null);
  const [formData, setFormData] = useState<QuarterlyGrade>({
    student: 0,
    subject: subjectId,
    quarter: selectedQuarter,
    written_work_score: 0,
    written_work_total: 100,
    performance_task_score: 0,
    performance_task_total: 100,
    quarterly_assessment_score: 0,
    quarterly_assessment_total: 100,
    ww_weight: 0.4,
    pt_weight: 0.4,
    qa_weight: 0.2,
    remarks: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchGrades();
  }, [subjectId, selectedQuarter]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, quarter: selectedQuarter }));
  }, [selectedQuarter]);

  const fetchStudents = async () => {
    try {
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      const response = await axios.get('http://127.0.0.1:8000/api/students/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      const response = await axios.get(
        `http://127.0.0.1:8000/api/quarterly-grades/?subject_id=${subjectId}&quarter=${selectedQuarter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingGrade(null);
    setFormData({
      student: 0,
      subject: subjectId,
      quarter: selectedQuarter,
      written_work_score: 0,
      written_work_total: 100,
      performance_task_score: 0,
      performance_task_total: 100,
      quarterly_assessment_score: 0,
      quarterly_assessment_total: 100,
      ww_weight: 0.4,
      pt_weight: 0.4,
      qa_weight: 0.2,
      remarks: ''
    });
    setShowModal(true);
  };

  const openEditModal = (grade: QuarterlyGrade) => {
    setEditingGrade(grade);
    setFormData({ ...grade });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGrade(null);
  };

  const handleInputChange = (field: keyof QuarterlyGrade, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student || formData.student === 0) {
      alert('Please select a student');
      return;
    }

    // Check if grade already exists for this student/subject/quarter combination (only for new entries)
    if (!editingGrade) {
      const existingGrade = grades.find(
        g => g.student === formData.student && 
             g.subject === subjectId && 
             g.quarter === selectedQuarter
      );
      
      if (existingGrade) {
        alert(`A grade already exists for this student in ${selectedQuarter}.\n\nPlease use the Edit button to update the existing grade instead.`);
        return;
      }
    }

    const payload = {
      student: formData.student,
      subject: subjectId,
      quarter: selectedQuarter,
      written_work_score: formData.written_work_score,
      written_work_total: formData.written_work_total,
      performance_task_score: formData.performance_task_score,
      performance_task_total: formData.performance_task_total,
      quarterly_assessment_score: formData.quarterly_assessment_score,
      quarterly_assessment_total: formData.quarterly_assessment_total,
      ww_weight: formData.ww_weight,
      pt_weight: formData.pt_weight,
      qa_weight: formData.qa_weight,
      remarks: formData.remarks || ''
    };

    try {
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;

      console.log('Submitting payload:', JSON.stringify(payload, null, 2));
      console.log('SubjectId prop value:', subjectId);

      if (editingGrade?.id) {
        await axios.put(
          `http://127.0.0.1:8000/api/quarterly-grades/${editingGrade.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Grade updated successfully!');
      } else {
        await axios.post(
          'http://127.0.0.1:8000/api/quarterly-grades/',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Grade added successfully!');
      }

      fetchGrades();
      closeModal();
    } catch (error: any) {
      console.error('Error saving grade:', error);
      console.error('Error response:', JSON.stringify(error.response?.data, null, 2));
      console.error('Payload sent:', JSON.stringify(payload, null, 2));
      
      const errorMsg = error.response?.data;
      let displayError = 'Failed to save grade:\n\n';
      
      if (typeof errorMsg === 'object') {
        // Format validation errors nicely
        for (const [field, messages] of Object.entries(errorMsg)) {
          if (Array.isArray(messages)) {
            displayError += `${field}: ${messages.join(', ')}\n`;
          } else {
            displayError += `${field}: ${messages}\n`;
          }
        }
      } else {
        displayError = errorMsg || 'Unknown error occurred';
      }
      
      alert(displayError);
    }
  };

  const handleDeleteGrade = async (gradeId: number) => {
    if (!confirm('Delete this grade entry?')) return;

    try {
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      await axios.delete(
        `http://127.0.0.1:8000/api/quarterly-grades/${gradeId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Grade deleted successfully!');
      fetchGrades();
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  };

  const calculateFinalGrade = (grade: QuarterlyGrade) => {
    const wwPct = (grade.written_work_score / grade.written_work_total * 100) || 0;
    const ptPct = (grade.performance_task_score / grade.performance_task_total * 100) || 0;
    const qaPct = (grade.quarterly_assessment_score / grade.quarterly_assessment_total * 100) || 0;
    
    return (wwPct * grade.ww_weight) + (ptPct * grade.pt_weight) + (qaPct * grade.qa_weight);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{subjectName}</h2>
            <p className="text-gray-600">Quarterly Grade Management</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Add Grade
            </button>
            <BookOpen size={32} className="text-blue-600" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <label className="font-semibold">Quarter:</label>
          <div className="flex gap-2">
            {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedQuarter === q
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-4 text-sm">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">WW: 40%</span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded">PT: 40%</span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded">QA: 20%</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>How to use:</strong> Click "Add Grade" to enter scores for a student. The system will automatically calculate the weighted final grade.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">WW Score</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PT Score</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">QA Score</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Final Grade</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading grades...</td>
                </tr>
              )}
              
              {!loading && grades.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No grades entered for {selectedQuarter} yet. Click "Add Grade" to get started.
                  </td>
                </tr>
              )}

              {!loading && grades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{grade.student_name}</p>
                      <p className="text-xs text-gray-500">{grade.student_id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm">{grade.written_work_score}/{grade.written_work_total}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm">{grade.performance_task_score}/{grade.performance_task_total}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm">{grade.quarterly_assessment_score}/{grade.quarterly_assessment_total}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-lg font-bold text-blue-600">
                      {grade.final_grade?.toFixed(2) || calculateFinalGrade(grade).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(grade)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => grade.id && handleDeleteGrade(grade.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {editingGrade ? 'Edit Grade' : 'Add New Grade'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                <select
                  value={formData.student}
                  onChange={(e) => handleInputChange('student', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!!editingGrade}
                >
                  <option value={0}>Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.student_id})
                    </option>
                  ))}
                </select>
                {editingGrade && (
                  <p className="text-xs text-gray-500 mt-1">Cannot change student for existing grade</p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-blue-900">Written Work (40%)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score *</label>
                    <input type="number" min="0" step="0.01" value={formData.written_work_score}
                      onChange={(e) => handleInputChange('written_work_score', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total *</label>
                    <input type="number" min="1" step="0.01" value={formData.written_work_total}
                      onChange={(e) => handleInputChange('written_work_total', parseFloat(e.target.value) || 100)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Percentage: {((formData.written_work_score / formData.written_work_total * 100) || 0).toFixed(2)}%
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-green-900">Performance Task (40%)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score *</label>
                    <input type="number" min="0" step="0.01" value={formData.performance_task_score}
                      onChange={(e) => handleInputChange('performance_task_score', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total *</label>
                    <input type="number" min="1" step="0.01" value={formData.performance_task_total}
                      onChange={(e) => handleInputChange('performance_task_total', parseFloat(e.target.value) || 100)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Percentage: {((formData.performance_task_score / formData.performance_task_total * 100) || 0).toFixed(2)}%
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-purple-900">Quarterly Assessment (20%)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score *</label>
                    <input type="number" min="0" step="0.01" value={formData.quarterly_assessment_score}
                      onChange={(e) => handleInputChange('quarterly_assessment_score', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total *</label>
                    <input type="number" min="1" step="0.01" value={formData.quarterly_assessment_total}
                      onChange={(e) => handleInputChange('quarterly_assessment_total', parseFloat(e.target.value) || 100)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Percentage: {((formData.quarterly_assessment_score / formData.quarterly_assessment_total * 100) || 0).toFixed(2)}%
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg">
                <p className="text-sm opacity-90 mb-1">Final Grade (Auto-calculated)</p>
                <p className="text-3xl font-bold">{calculateFinalGrade(formData).toFixed(2)}%</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher's Remarks</label>
                <textarea value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Optional comments about student performance..." />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  <Save size={18} />
                  {editingGrade ? 'Update Grade' : 'Add Grade'}
                </button>
                <button type="button" onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
        <p><strong>Note:</strong> This interface allows you to enter quarterly grades for all students across Q1-Q4.</p>
        <p className="mt-2">
          For detailed grade entry per activity, use: <button onClick={() => navigate('/teacher/gradebook')} className="text-blue-600 hover:underline">Main Gradebook</button>
        </p>
      </div>
    </div>
  );
}
