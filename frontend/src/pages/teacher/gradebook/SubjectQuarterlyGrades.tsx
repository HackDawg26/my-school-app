import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { Save, Plus, Edit2, Trash2, BookOpen, X, ArrowLeft } from "lucide-react";

/** ---------------- Types ---------------- */

interface Student {
  id: number;
  school_id: string;
  first_name: string;
  last_name: string;
}

interface QuarterlyGrade {
  id?: number;

  student: number;
  student_id?: string;
  student_name?: string;

  SubjectOffering: number;
  quarter: string;

  written_work_score: number | null;
  written_work_total: number;

  performance_task_score: number | null;
  performance_task_total: number;

  quarterly_assessment_score: number | null;
  quarterly_assessment_total: number;

  ww_weight: number; // decimals (0.4)
  pt_weight: number; // decimals (0.3)
  qa_weight: number; // decimals (0.3)

  final_grade?: number;
  remarks: string;
}


/** ---------------- Weights helpers ---------------- */

// UI can be blank while editing
type UiWeightValue = number | "";
type UiWeights = { ww: UiWeightValue; pt: UiWeightValue; qa: UiWeightValue };

const DEFAULT_UI_WEIGHTS: UiWeights = { ww: 40, pt: 40, qa: 20 };

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));
const n0 = (v: UiWeightValue) => (v === "" ? 0 : Number(v));
const sumWeights = (w: UiWeights) => n0(w.ww) + n0(w.pt) + n0(w.qa);

const toDecimal = (pct: number) => pct / 100;
const toPct = (dec: number) => Math.round(Number(dec) * 100);

export default function TeacherQuarterlyGrades() {
  const navigate = useNavigate();
  const {id} = useParams();
  const subjectoffering_id = Number(id);

  useEffect(() => {
    if (!Number.isFinite(subjectoffering_id)) {
      navigate("/teacher/grades"); // or wherever
      return;
    }
  }, [subjectoffering_id, navigate]);

  const location = useLocation();
  const [subjectName, setSubjectName] = useState<string>(
    (location.state as any)?.subjectName || "Subject"
  );

  useEffect(() => {
    const fromState = (location.state as any)?.subjectName;
    if (fromState) {
      setSubjectName(fromState);
      return;
    }

    if (!Number.isFinite(subjectoffering_id)) return;

    (async () => {
      try {
        const token = getToken();
        const res = await axios.get(
          `http://127.0.0.1:8000/api/subject-offerings/${subjectoffering_id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // adjust depending on your backend response shape
        setSubjectName(res.data?.name ?? "Subject");
      } catch (err) {
        console.error("Error fetching subject name:", err);
      }
    })();
  }, [subjectoffering_id, location.state]);


  /** ---------------- State ---------------- */

  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<QuarterlyGrade[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<string>("Q1");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<QuarterlyGrade | null>(null);

  // Draft weights (what user types)
  const [uiWeights, setUiWeights] = useState<UiWeights>(DEFAULT_UI_WEIGHTS);
  // Applied weights (USED in computations)
  const [appliedWeights, setAppliedWeights] = useState<UiWeights>(DEFAULT_UI_WEIGHTS);

  const [formData, setFormData] = useState<QuarterlyGrade>({
    student: 0,
    SubjectOffering: subjectoffering_id,
    quarter: "Q1",

    written_work_score: null,
    written_work_total: 100,

    performance_task_score: null,
    performance_task_total: 100,

    quarterly_assessment_score: null,
    quarterly_assessment_total: 100,

    ww_weight: toDecimal(n0(DEFAULT_UI_WEIGHTS.ww)),
    pt_weight: toDecimal(n0(DEFAULT_UI_WEIGHTS.pt)),
    qa_weight: toDecimal(n0(DEFAULT_UI_WEIGHTS.qa)),

    remarks: "",
  });

  const weightsStorageKey = useMemo(
    () => `weights:${subjectoffering_id}:${selectedQuarter}`,
    [subjectoffering_id, selectedQuarter]
  );

  /** ---------------- Fetching ---------------- */

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectoffering_id]);

  useEffect(() => {
    fetchGrades();
    loadWeightsForQuarter(); // loads BOTH draft + applied from storage
    setFormData((prev) => ({ ...prev, quarter: selectedQuarter }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectoffering_id, selectedQuarter]);

  const getToken = () => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser).token : null;
  };

  const fetchStudents = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `http://127.0.0.1:8000/api/subject-offerings/${subjectoffering_id}/students/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(
        `http://127.0.0.1:8000/api/quarterly-grades/?SubjectOffering_id=${subjectoffering_id}&quarter=${selectedQuarter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGrades(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching grades:", error);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  console.log("Grades:", grades);

  /** ---------------- Weights (per quarter) ---------------- */

  const loadWeightsForQuarter = () => {
    const raw = localStorage.getItem(weightsStorageKey);
    if (!raw) {
      setUiWeights(DEFAULT_UI_WEIGHTS);
      setAppliedWeights(DEFAULT_UI_WEIGHTS);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { ww?: number; pt?: number; qa?: number };

      const loaded: UiWeights = {
        // use ?? so 0 doesn't get replaced
        ww: clamp(Number(parsed.ww ?? DEFAULT_UI_WEIGHTS.ww)),
        pt: clamp(Number(parsed.pt ?? DEFAULT_UI_WEIGHTS.pt)),
        qa: clamp(Number(parsed.qa ?? DEFAULT_UI_WEIGHTS.qa)),
      };

      setUiWeights(loaded);
      setAppliedWeights(loaded);
    } catch (e) {
      console.error("Invalid stored weights:", e);
      setUiWeights(DEFAULT_UI_WEIGHTS);
      setAppliedWeights(DEFAULT_UI_WEIGHTS);
    }
  };

  const saveWeightsForQuarter = (next: UiWeights) => {
    localStorage.setItem(weightsStorageKey, JSON.stringify(next));
  };

  // Draft editing only (NO computation changes here)
  const updateUiWeight = (field: keyof UiWeights, raw: string) => {
    setUiWeights((prev) => {
      if (raw === "") return { ...prev, [field]: "" };
      return { ...prev, [field]: clamp(Number(raw)) };
    });
  };

  // Apply = affects computations + persists + used for new grade form
  const applyWeights = async () => {
    const total = sumWeights(uiWeights);
    const allFilled = uiWeights.ww !== "" && uiWeights.pt !== "" && uiWeights.qa !== "";

    if (!allFilled) {
      alert("Please fill in all weights.");
      return;
    }
    if (total !== 100) {
      alert("Weights must total 100%.");
      return;
    }

    const ww = toDecimal(n0(uiWeights.ww));
    const pt = toDecimal(n0(uiWeights.pt));
    const qa = toDecimal(n0(uiWeights.qa));

    try {
      const token = getToken();

      // ✅ 1) Persist in backend so final_grade updates (affects Advisory)
      await axios.post(
        "http://127.0.0.1:8000/api/quarterly-grades/bulk-apply-weights/",
        {
          SubjectOffering: subjectoffering_id,
          quarter: selectedQuarter,
          ww_weight: ww,
          pt_weight: pt,
          qa_weight: qa,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ 2) Keep local UI state (optional but fine)
      setAppliedWeights(uiWeights);
      saveWeightsForQuarter(uiWeights);

      // ✅ 3) Refresh grades from backend (now includes recomputed final_grade)
      await fetchGrades();

      // ✅ 4) Update add-form default weights
      if (!editingGrade) {
        setFormData((prev) => ({
          ...prev,
          ww_weight: ww,
          pt_weight: pt,
          qa_weight: qa,
        }));
      }

      alert("Weights applied successfully!");
    } catch (err: any) {
      console.error("Failed to apply weights:", err?.response?.data || err);
      alert("Failed to apply weights. Make sure the backend endpoint exists and you are authorized.");
    }
  };


  const resetWeights = () => {
    setUiWeights(DEFAULT_UI_WEIGHTS);
    setAppliedWeights(DEFAULT_UI_WEIGHTS);
    saveWeightsForQuarter(DEFAULT_UI_WEIGHTS);

    if (!editingGrade) {
      setFormData((prev) => ({
        ...prev,
        ww_weight: toDecimal(n0(DEFAULT_UI_WEIGHTS.ww)),
        pt_weight: toDecimal(n0(DEFAULT_UI_WEIGHTS.pt)),
        qa_weight: toDecimal(n0(DEFAULT_UI_WEIGHTS.qa)),
      }));
    }
  };

  // For computations only
  const appliedDecimals = useMemo(() => {
    return {
      ww: toDecimal(n0(appliedWeights.ww)),
      pt: toDecimal(n0(appliedWeights.pt)),
      qa: toDecimal(n0(appliedWeights.qa)),
    };
  }, [appliedWeights]);

  const weightChips = useMemo(() => {
    return {
      ww: uiWeights.ww,
      pt: uiWeights.pt,
      qa: uiWeights.qa,
      total: sumWeights(uiWeights),
    };
  }, [uiWeights]);

  const appliedChips = useMemo(() => {
    return {
      ww: n0(appliedWeights.ww),
      pt: n0(appliedWeights.pt),
      qa: n0(appliedWeights.qa),
      total: sumWeights(appliedWeights),
    };
  }, [appliedWeights]);

  /** ---------------- Modal helpers ---------------- */

  const openAddModal = () => {
    setEditingGrade(null);

    // IMPORTANT: use APPLIED weights when adding a grade
    const ww = toDecimal(n0(appliedWeights.ww));
    const pt = toDecimal(n0(appliedWeights.pt));
    const qa = toDecimal(n0(appliedWeights.qa));

    setFormData({
      student: 0,
      SubjectOffering: subjectoffering_id,
      quarter: selectedQuarter,

      written_work_score: null,
      written_work_total: 100,

      performance_task_score: null,
      performance_task_total: 100,

      quarterly_assessment_score: null,
      quarterly_assessment_total: 100,

      ww_weight: ww,
      pt_weight: pt,
      qa_weight: qa,

      remarks: "",
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /** ---------------- Calculations ---------------- */

  // This uses APPLIED weights, so list updates immediately when you click Apply
  const calculateFinalGrade = (grade: QuarterlyGrade) => {
    const wwPct = ((Number(grade.written_work_score) / Number(grade.written_work_total)) * 100) || 0;
    const ptPct = ((Number(grade.performance_task_score) / Number(grade.performance_task_total)) * 100) || 0;
    const qaPct = ((Number(grade.quarterly_assessment_score) / Number(grade.quarterly_assessment_total)) * 100) || 0;

    const wwW = Number(grade.ww_weight) || 0;
    const ptW = Number(grade.pt_weight) || 0;
    const qaW = Number(grade.qa_weight) || 0;

    return wwPct * wwW + ptPct * ptW + qaPct * qaW;
  };


  /** ---------------- Submit / Delete ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student || formData.student === 0) {
      alert("Please select a student");
      return;
    }

    // For add: require applied weights total 100
    if (!editingGrade) {
      if (appliedChips.total !== 100) {
        alert("Applied weights for this quarter must total 100%. Click Apply first.");
        return;
      }
    } else {
      // Editing grade keeps its stored weights (decimals) validation
      const decSum = Number(formData.ww_weight) + Number(formData.pt_weight) + Number(formData.qa_weight);
      if (Math.abs(decSum - 1) > 0.0001) {
        alert("This grade has invalid weights. They must total 1.0 (100%).");
        return;
      }
    }

    if (!editingGrade) {
      const existingGrade = grades.find(
        (g) =>
          g.student === formData.student &&
          g.SubjectOffering === subjectoffering_id &&
          g.quarter === selectedQuarter
      );
      if (existingGrade) {
        alert(
          `A grade already exists for this student in ${selectedQuarter}.\n\nPlease use the Edit button to update the existing grade instead.`
        );
        return;
      }
    }

    const payload = {
      student: formData.student,
      SubjectOffering: subjectoffering_id,
      quarter: selectedQuarter,

      written_work_score: formData.written_work_score,
      written_work_total: formData.written_work_total,

      performance_task_score: formData.performance_task_score,
      performance_task_total: formData.performance_task_total,

      quarterly_assessment_score: formData.quarterly_assessment_score,
      quarterly_assessment_total: formData.quarterly_assessment_total,

      // IMPORTANT: when adding, formData already has applied weights
      ww_weight: formData.ww_weight,
      pt_weight: formData.pt_weight,
      qa_weight: formData.qa_weight,

      remarks: formData.remarks || "",
    };

    try {
      const token = getToken();

      if (editingGrade?.id) {
        await axios.put(
          `http://127.0.0.1:8000/api/quarterly-grades/${editingGrade.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Grade updated successfully!");
      } else {
        await axios.post("http://127.0.0.1:8000/api/quarterly-grades/", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Grade added successfully!");
      }

      fetchGrades();
      closeModal();
    } catch (error: any) {
      console.error("Error saving grade:", error);

      const errorMsg = error.response?.data;
      let displayError = "Failed to save grade:\n\n";

      if (typeof errorMsg === "object") {
        for (const [field, messages] of Object.entries(errorMsg)) {
          if (Array.isArray(messages)) displayError += `${field}: ${messages.join(", ")}\n`;
          else displayError += `${field}: ${messages}\n`;
        }
      } else {
        displayError = errorMsg || "Unknown error occurred";
      }

      alert(displayError);
    }
  };

  const handleDeleteGrade = async (gradeId: number) => {
    if (!confirm("Delete this grade entry?")) return;

    try {
      const token = getToken();
      await axios.delete(`http://127.0.0.1:8000/api/quarterly-grades/${gradeId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Grade deleted successfully!");
      fetchGrades();
    } catch (error) {
      console.error("Error deleting grade:", error);
    }
  };

  /** ---------------- UI ---------------- */

  return (
    <div className="mx-auto  px-3 sm:px-4 md:px-6 py-4 space-y-4">
      {/* ✅ Sticky mobile header */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur border-b border-slate-200 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50  hover:text-indigo-800">
              <ArrowLeft size={16} />
                Back

            </button>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Quarterly Grades
            </div>
            <h2 className="mt-1 text-base sm:text-lg font-black text-slate-900 truncate">{subjectName}</h2>
            <p className="text-xs text-slate-500">Manage grades per quarter</p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-3 py-2 text-xs sm:text-sm font-black hover:bg-emerald-700"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Grade</span>
              <span className="sm:hidden">Add</span>
            </button>
            <BookOpen size={22} className="text-indigo-600 hidden sm:block" />
          </div>
        </div>

        {/* ✅ Quarter buttons: scrollable on mobile */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {["Q1", "Q2", "Q3", "Q4"].map((q) => (
            <button
              key={q}
              onClick={() => setSelectedQuarter(q)}
              className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition ${
                selectedQuarter === q
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Weights */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-900">Weights for {selectedQuarter}</p>
            <p className="text-xs text-slate-500">
              Draft weights won’t affect computation until you click <span className="font-black">Apply</span>.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={resetWeights}
              className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider"
              title="Reset to 40/40/20"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={applyWeights}
              disabled={uiWeights.ww === "" || uiWeights.pt === "" || uiWeights.qa === "" || sumWeights(uiWeights) !== 100}
              className={`px-3 py-2 rounded-2xl text-xs font-black uppercase tracking-wider ${
                uiWeights.ww === "" || uiWeights.pt === "" || uiWeights.qa === "" || sumWeights(uiWeights) !== 100
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Apply
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* WW */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-700 uppercase tracking-wider">WW</span>
              <span className="text-[11px] text-slate-500">%</span>
            </div>
            <input
              type="number"
              min={0}
              max={100}
              value={uiWeights.ww}
              onChange={(e) => updateUiWeight("ww", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* PT */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">PT</span>
              <span className="text-[11px] text-slate-500">%</span>
            </div>
            <input
              type="number"
              min={0}
              max={100}
              value={uiWeights.pt}
              onChange={(e) => updateUiWeight("pt", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* QA */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-700 uppercase tracking-wider">QA</span>
              <span className="text-[11px] text-slate-500">%</span>
            </div>
            <input
              type="number"
              min={0}
              max={100}
              value={uiWeights.qa}
              onChange={(e) => updateUiWeight("qa", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Draft total: <span className="font-black text-slate-900">{weightChips.total}%</span>
          </div>
          {weightChips.total !== 100 ? (
            <span className="text-xs font-black text-rose-600">Must equal 100%</span>
          ) : (
            <span className="text-xs font-black text-emerald-600">OK</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-2xl font-black">
            Applied: WW {appliedChips.ww}% • PT {appliedChips.pt}% • QA {appliedChips.qa}%
          </span>
        </div>
      </div>

      {/* ✅ Mobile-first grade list (cards), table only on md+ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-slate-600">Loading grades…</div>
          ) : grades.length === 0 ? (
            <div className="p-6 text-center text-slate-600">
              No grades for <span className="font-black">{selectedQuarter}</span>. Tap “Add” to start.
            </div>
          ) : (
            grades.map((g) => {
              const final = Number(g.final_grade ?? 0).toFixed(2)

              return (
                <div key={g.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 truncate">{g.student_name}</div>
                      <div className="text-xs text-slate-500 truncate">{g.student_id}</div>
                      <div className="mt-2 text-xs text-slate-600 space-y-1">
                        <div>
                          <span className="font-black text-blue-700">WW:</span> {g.written_work_score}/{g.written_work_total}
                        </div>
                        <div>
                          <span className="font-black text-emerald-700">PT:</span> {g.performance_task_score}/{g.performance_task_total}
                        </div>
                        <div>
                          <span className="font-black text-purple-700">QA:</span> {g.quarterly_assessment_score}/{g.quarterly_assessment_total}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final</div>
                      <div className="text-2xl font-black text-indigo-600">{final}</div>
                      <div className="mt-1 text-[10px] text-slate-500 font-bold">
                        W:{appliedChips.ww} P:{appliedChips.pt} Q:{appliedChips.qa}
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(g)}
                          className="p-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-indigo-600"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => g.id && handleDeleteGrade(g.id)}
                          className="p-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-rose-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {g.remarks ? (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Remarks
                      </div>
                      <div className="mt-1">{g.remarks}</div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                  Student
                </th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                  WW
                </th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                  PT
                </th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                  QA
                </th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                  Final
                </th>
                <th className="px-4 py-3 text-right text-xs font-black text-slate-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-600">
                    Loading grades…
                  </td>
                </tr>
              ) : grades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-600">
                    No grades entered for {selectedQuarter} yet.
                  </td>
                </tr>
              ) : (
                grades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-black text-slate-900">{g.student_name}</div>
                      <div className="text-xs text-slate-500">{g.student_id}</div>
                    </td>

                    <td className="px-4 py-3 text-center text-sm text-slate-700">
                      {g.written_work_score}/{g.written_work_total}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">
                      {g.performance_task_score}/{g.performance_task_total}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">
                      {g.quarterly_assessment_score}/{g.quarterly_assessment_total}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="text-lg font-black text-indigo-600">
                        {Number(g.final_grade ?? 0).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Applied W:{appliedChips.ww} / P:{appliedChips.pt} / Q:{appliedChips.qa}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(g)}
                          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-indigo-600"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => g.id && handleDeleteGrade(g.id)}
                          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-rose-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding grade to another student */}
      {/* i might delete this later, it seems its unnecessary */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl border border-slate-200 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between">
              <h3 className="text-base sm:text-xl font-black text-slate-900">
                {editingGrade ? `Edit Grade (${selectedQuarter})` : `Add New Grade (${selectedQuarter})`}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-2xl hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Weights used in this entry
                </div>
                <div className="mt-1 font-bold">
                  WW {toPct(formData.ww_weight)}% • PT {toPct(formData.pt_weight)}% • QA {toPct(formData.qa_weight)}%
                </div>
                {!editingGrade ? (
                  <div className="text-xs text-slate-500 mt-1">
                    (New grade uses the <span className="font-black">Applied</span> weights above)
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                  Student *
                </label>
                <select
                  value={formData.student}
                  onChange={(e) => handleInputChange("student", parseInt(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={!!editingGrade}
                >
                  <option value={0}>Select a student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.school_id})
                    </option>
                  ))}
                </select>
                {editingGrade ? (
                  <p className="text-xs text-slate-500 mt-2">Cannot change student for existing grade</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ScoreBlock
                  title={`Written Work (${toPct(formData.ww_weight)}%)`}
                  theme="blue"
                  score={formData.written_work_score}
                  total={formData.written_work_total}
                  onScore={(v) => handleInputChange("written_work_score", v)}
                  onTotal={(v) => handleInputChange("written_work_total", v)}
                />
                <ScoreBlock
                  title={`Performance Task (${toPct(formData.pt_weight)}%)`}
                  theme="green"
                  score={formData.performance_task_score}
                  total={formData.performance_task_total}
                  onScore={(v) => handleInputChange("performance_task_score", v)}
                  onTotal={(v) => handleInputChange("performance_task_total", v)}
                />
                <ScoreBlock
                  title={`Quarterly Assessment (${toPct(formData.qa_weight)}%)`}
                  theme="purple"
                  score={formData.quarterly_assessment_score}
                  total={formData.quarterly_assessment_total}
                  onScore={(v) => handleInputChange("quarterly_assessment_score", v)}
                  onTotal={(v) => handleInputChange("quarterly_assessment_total", v)}
                />
              </div>

              <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                <div className="text-xs font-black uppercase tracking-widest text-white/80">Final Grade</div>
                <div className="mt-1 text-3xl font-black">{calculateFinalGrade(formData).toFixed(2)}%</div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional comments..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-white px-4 py-3 text-sm font-black hover:bg-indigo-700"
                >
                  <Save size={18} />
                  {editingGrade ? "Update Grade" : "Add Grade"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="sm:w-40 inline-flex items-center justify-center rounded-2xl bg-slate-100 text-slate-800 px-4 py-3 text-sm font-black hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>

              <div className="pt-2 text-xs text-slate-500">
                Tip: If you want different weights per quarter, set them above then click Apply.
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <div className="font-black text-slate-900">Note</div>
        <p className="mt-1 text-sm text-slate-600">
          This page lets you encode quarterly grades (Q1–Q4). For activity-based grading, check your analytics.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/teacher/subject/${subjectoffering_id}/analytics`)}
          className="mt-3 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-indigo-600 hover:bg-indigo-50"
        >
          Open Analytics
        </button>
      </div>
    </div>
  );
}

/** small reusable block for the modal */
function ScoreBlock(props: {
  title: string;
  theme: "blue" | "green" | "purple";
  score: number | null;
  total: number;
  onScore: (v: number | null) => void;
  onTotal: (v: number) => void;
}) {
  const themeMap = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    purple: "border-purple-200 bg-purple-50 text-purple-900",
  } as const;

  return (
    <div className={`rounded-3xl border p-3 ${themeMap[props.theme]}`}>
      <div className="text-xs font-black uppercase tracking-widest">{props.title}</div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">
            Score
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={props.score ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              props.onScore(raw === "" ? null : Number(raw));
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">
            Total
          </label>
          <input
            type="number"
            min={1}
            step="0.01"
            value={props.total}
            onChange={(e) => props.onTotal(Number(e.target.value) || 1)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-700">
        %: {(((Number(props.score) / props.total) * 100) || 0).toFixed(2)}%
      </div>
    </div>
  );
}
