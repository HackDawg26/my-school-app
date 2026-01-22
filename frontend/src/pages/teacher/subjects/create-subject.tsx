import React, { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

/* ---------- Types ---------- */
interface Section {
  id: number;
  name: string;
  grade_level: string;
}

interface SubjectOfferingFormData {
  name: string;
  section: number | ""; // Matches Django's ForeignKey 'section'
  room_number: string;
  schedule: string;
}

/* ---------- Component ---------- */
export default function AssignSubjectOffering() {
  const [sections, setSections] = useState<Section[]>([]);
  const [formData, setFormData] = useState<SubjectOfferingFormData>({
    name: "",
    section: "",
    room_number: "",
    schedule: "",
  });

  const token = localStorage.getItem("access");

  /* ---------- Fetch Sections ---------- */
  useEffect(() => {
    if (!token) return;

    fetch("http://127.0.0.1:8000/api/sections/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setSections)
      .catch(console.error);
  }, [token]);

  /* ---------- Handlers ---------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Please enter a subject name");
    if (!formData.section) return alert("Please select a section");
    if (!formData.room_number) return alert("Please enter a room number");
    if (!formData.schedule) return alert("Please enter a schedule");
    if (!token) return alert("Not authenticated");

    const payload = {
      name: formData.name,
      section_id: formData.section, // Must match serializer field
      room_number: formData.room_number,
      schedule: formData.schedule,
    };

    const res = await fetch("http://127.0.0.1:8000/api/subject-offerings/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      alert("Failed to create subject offering");
      return;
    }

    alert("Subject offering created successfully");
    setFormData({ name: "", section: "", room_number: "", schedule: "" });
  };

  const selectedSection = sections.find(
    (section) => section.id === formData.section
  );

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
          Assign Subject Offering
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Subject Name */}
          <div>
            <label className={labelClasses}>Subject Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={inputClasses}
              required
            />
          </div>

          {/* Section Selector */}
          <div>
            <label className={labelClasses}>Section</label>
            <select
              value={formData.section}
              onChange={(e) =>
                setFormData({ ...formData, section: Number(e.target.value) })
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

          {/* Room Number */}
          <div>
            <label className={labelClasses}>Room Number</label>
            <input
              type="text"
              value={formData.room_number}
              onChange={(e) =>
                setFormData({ ...formData, room_number: e.target.value })
              }
              className={inputClasses}
              required
            />
          </div>

          {/* Schedule */}
          <div>
            <label className={labelClasses}>Schedule</label>
            <input
              type="text"
              value={formData.schedule}
              onChange={(e) =>
                setFormData({ ...formData, schedule: e.target.value })
              }
              className={inputClasses}
              placeholder="e.g., M/W/F 1:00 PM - 2:30 PM"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
          >
            Assign Subject Offering
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
