import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

interface Subject {
  id: number;
  name: string;
}

type QuizStatus = "DRAFT" | "SCHEDULED" | "OPEN" | "CLOSED";

type CreateQuizForm = {
  subject: string; // subject offering id as string for <select>
  title: string;
  description: string;
  open_time: string; // datetime-local
  close_time: string; // datetime-local
  time_limit: number;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  total_points: number;
  passing_score: number;
  status: QuizStatus;
  show_correct_answers: boolean;
  shuffle_questions: boolean;
  allow_multiple_attempts: boolean;
};

function getToken(): string | null {
  const savedUser = localStorage.getItem("user");
  try {
    return savedUser ? JSON.parse(savedUser).token : null;
  } catch {
    return null;
  }
}

export default function CreateQuiz() {
  const { id } = useParams<{ id: string }>(); // /teacher/subject/:id/activities/create
  const subjectIdFromRoute = id ? Number(id) : null;

  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [useCustomSubject, setUseCustomSubject] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");

  const [formData, setFormData] = useState<CreateQuizForm>({
    subject: "",
    title: "",
    description: "",
    open_time: "",
    close_time: "",
    time_limit: 60,
    quarter: "Q1",
    total_points: 100,
    passing_score: 60,
    status: "SCHEDULED",
    show_correct_answers: false,
    shuffle_questions: false,
    allow_multiple_attempts: false,
  });

  const cancelPath = useMemo(() => {
    return subjectIdFromRoute
      ? `/teacher/subject/${subjectIdFromRoute}/activities`
      : `/teacher/activities`;
  }, [subjectIdFromRoute]);

  // Fetch subject offerings
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const token = getToken();
        const res = await axios.get("http://127.0.0.1:8000/api/subject-offerings/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(res.data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setSubjects([
          { id: 1, name: "Mathematics" },
          { id: 2, name: "Science" },
          { id: 3, name: "English" },
          { id: 4, name: "History" },
          { id: 5, name: "Filipino" },
          { id: 6, name: "Computer Science" },
        ]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // Auto-lock subject when opened from a subject page
  useEffect(() => {
    if (!subjectIdFromRoute) return;

    setUseCustomSubject(false);
    setSubjectInput("");
    setFormData((prev) => ({
      ...prev,
      subject: String(subjectIdFromRoute),
    }));
  }, [subjectIdFromRoute]);

  const selectedSubjectName = useMemo(() => {
    if (!subjectIdFromRoute) return null;
    return subjects.find((s) => s.id === subjectIdFromRoute)?.name ?? null;
  }, [subjectIdFromRoute, subjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Subject offering id to send (prefer locked subject from route)
    const subjectOfferingId = subjectIdFromRoute
      ? subjectIdFromRoute
      : Number(formData.subject || 0);

    if (!subjectOfferingId) {
      alert("Please select a subject.");
      return;
    }

    // If you're keeping "custom subject" UI, block it for now (no backend support)
    if (useCustomSubject) {
      alert("Custom subject names are not supported yet. Please choose from the list.");
      return;
    }

    try {
      const token = getToken();

      const payload = {
        ...formData,
        SubjectOffering: subjectOfferingId,
        open_time: new Date(formData.open_time).toISOString(),
        close_time: new Date(formData.close_time).toISOString(),
      };

      const res = await axios.post("http://127.0.0.1:8000/api/teacher/quizzes/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.id) {
        alert("Activity created successfully! Now add questions to your quiz.");
        navigate(`/teacher/activities/${res.data.id}`);
        return;
      }

      alert("Activity created but navigation failed. Please check your activities list.");
      navigate(cancelPath);
    } catch (error: any) {
      console.error("Error creating quiz:", error);
      console.error("Error response:", error.response?.data);
      alert(`Failed to create activity: ${JSON.stringify(error.response?.data || "Unknown error")}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Activity</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium mb-2">Subject *</label>

          {subjectIdFromRoute ? (
            <div>
              <div className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700">
                {selectedSubjectName ?? (loadingSubjects ? "Loading subject..." : `Subject #${subjectIdFromRoute}`)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Subject is fixed because you are creating this activity inside a subject.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {!useCustomSubject ? (
                <>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    disabled={loadingSubjects}
                  >
                    <option value="">{loadingSubjects ? "Loading subjects..." : "Select Subject"}</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  {/* Keep UI but you can remove this entirely if you don't want it */}
                  <button
                    type="button"
                    onClick={() => setUseCustomSubject(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Or enter custom subject name
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter subject name (e.g., Physics, Arts)"
                  />
                  <p className="text-xs text-amber-600">
                    Custom subjects are not supported yet (backend). Please use the list.
                  </p>
                  <button
                    type="button"
                    onClick={() => setUseCustomSubject(false)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Choose from list instead
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Quiz Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Midterm Exam - Algebra"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Quiz instructions or description"
          />
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Open Time *</label>
            <input
              type="datetime-local"
              required
              value={formData.open_time}
              onChange={(e) => setFormData({ ...formData, open_time: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Close Time *</label>
            <input
              type="datetime-local"
              required
              value={formData.close_time}
              onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              value={formData.time_limit}
              onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value, 10) || 0 })}
              className="w-full border rounded px-3 py-2"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quarter</label>
            <select
              value={formData.quarter}
              onChange={(e) => setFormData({ ...formData, quarter: e.target.value as CreateQuizForm["quarter"] })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passing Score</label>
            <input
              type="number"
              value={formData.passing_score}
              onChange={(e) => setFormData({ ...formData, passing_score: parseFloat(e.target.value) || 0 })}
              className="w-full border rounded px-3 py-2"
              min="0"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as QuizStatus })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="DRAFT">Draft (Not visible to students)</option>
            <option value="SCHEDULED">Scheduled (Visible to students)</option>
            <option value="OPEN">Open (Available now)</option>
            <option value="CLOSED">Closed</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Tip: Use "Scheduled" to make quiz visible to students. The quiz will automatically open/close based on the
            times you set.
          </p>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.show_correct_answers}
              onChange={(e) => setFormData({ ...formData, show_correct_answers: e.target.checked })}
            />
            <span className="text-sm">Show correct answers after submission</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.shuffle_questions}
              onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
            />
            <span className="text-sm">Shuffle questions</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.allow_multiple_attempts}
              onChange={(e) => setFormData({ ...formData, allow_multiple_attempts: e.target.checked })}
            />
            <span className="text-sm">Allow multiple attempts</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create Activity
          </button>

          <button
            type="button"
            onClick={() => navigate(cancelPath)}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
