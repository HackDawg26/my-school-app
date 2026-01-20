import React, { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

/* ---------- Types ---------- */

interface Subject {
  id: number;
  name: string;
}

interface Section {
  id: number;
  name: string;
  grade_level: string;
}

interface AssignSubjectFormData {
  subjectId: number | "";
  sectionId: number | "";
}

/* ---------- Component ---------- */

export default function AssignSubject() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [formData, setFormData] = useState<AssignSubjectFormData>({
    subjectId: "",
    sectionId: "",
  });

  /* ---------- Fetch Existing Data ---------- */

  useEffect(() => {
  const token = localStorage.getItem("access");

  if (!token) return;

  fetch("http://127.0.0.1:8000/api/subjects/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then(setSubjects)
    .catch(console.error);

  fetch("http://127.0.0.1:8000/api/sections/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then(setSections)
    .catch(console.error);
}, []);

  /* ---------- Helpers ---------- */

  const selectedSection = sections.find(
    (section) => section.id === formData.sectionId
  );

  /* ---------- Submit ---------- */

  const handleSubmit = (e: FormEvent) => {
  e.preventDefault();

  if (!formData.subjectId) return alert("Please select a subject");
  if (!formData.sectionId) return alert("Please select a section");

  const token = localStorage.getItem("access");
  if (!token) return;


  // POST to the correct endpoint
  fetch(`http://127.0.0.1:8000/api/subjects/${formData.subjectId}/assign-section/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ section_id: formData.sectionId })
})
    .then((res) => {
      if (!res.ok) throw new Error("Failed to assign subject");
      alert("Subject assigned successfully");
      setFormData({ subjectId: "", sectionId: "" });
    })
    .catch(console.error);
};
  /* ---------- Styles ---------- */

  const inputClasses =
    "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white";

  const labelClasses =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  /* ---------- Render ---------- */

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl">

        <h2 className="text-3xl font-bold text-center mb-6 dark:text-white">
          Assign Subject
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Subject */}
          <div>
            <label className={labelClasses}>Subject</label>
            <select
              value={formData.subjectId}
              onChange={(e) =>
                setFormData({ ...formData, subjectId: Number(e.target.value) })
              }
              className={inputClasses}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className={labelClasses}>Section</label>
            <select
              value={formData.sectionId}
              onChange={(e) =>
                setFormData({ ...formData, sectionId: Number(e.target.value) })
              }
              className={inputClasses}
              required
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name} — {section.grade_level}
                </option>
              ))}
            </select>
          </div>

          {/* Auto Grade Display */}
          {selectedSection && (
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                <strong>Grade Level:</strong> {selectedSection.grade_level}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
          >
            Assign Subject
          </button>

          {/* Cancel */}
          <Link
            to="/teacher/subject"
            className="block text-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel and Go Back
          </Link>
        </form>
      </div>
    </div>
  );
}
