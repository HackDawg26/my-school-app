import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useCreateTeacherQuiz,
  useTeacherSubjects,
} from "../../../hooks/useTeacherSubjects";

import type {
  QuizStatus,
  Semester,
} from "../../../types/teacherTypes";

type CreateQuizForm = {
  subject: string;

  title: string;
  description: string;

  open_time: string;
  close_time: string;

  time_limit: number;

  semester: Semester;

  total_points: number;
  passing_score: number;

  status: QuizStatus;

  show_correct_answers: boolean;
  shuffle_questions: boolean;
  allow_multiple_attempts: boolean;
};

export default function CreateQuiz() {
  const { id } =
    useParams<{ id: string }>();

  const subjectIdFromRoute =
    id ? Number(id) : null;

  const navigate =
    useNavigate();

  const {
    data: subjects = [],
    isLoading:
      loadingSubjects,
    isError:
      subjectsError,
    error:
      subjectsErrorData,
    refetch:
      refetchSubjects,
  } = useTeacherSubjects();

  const createQuiz =
    useCreateTeacherQuiz();

  const [formData, setFormData] =
    useState<CreateQuizForm>({
      subject: "",

      title: "",
      description: "",

      open_time: "",
      close_time: "",

      time_limit: 60,

      semester:
        "SEMESTER_1",

      total_points: 100,
      passing_score: 60,

      status:
        "SCHEDULED",

      show_correct_answers:
        false,

      shuffle_questions:
        false,

      allow_multiple_attempts:
        false,
    });

  const cancelPath =
    useMemo(() => {
      return subjectIdFromRoute
        ? `/teacher/subject/${subjectIdFromRoute}/activities`
        : "/teacher/activities";
    }, [subjectIdFromRoute]);

  // Lock subject when this page
  // was opened inside a subject.
  useEffect(() => {
    if (
      !subjectIdFromRoute
    ) {
      return;
    }

    setFormData(
      (prev) => ({
        ...prev,

        subject: String(
          subjectIdFromRoute
        ),
      })
    );
  }, [subjectIdFromRoute]);

  const selectedSubjectName =
    useMemo(() => {
      if (
        !subjectIdFromRoute
      ) {
        return null;
      }

      const subject =
        subjects.find(
          (item) =>
            item.id ===
            subjectIdFromRoute
        );

      return (
        subject?.name ??
        null
      );
    }, [
      subjectIdFromRoute,
      subjects,
    ]);

  const handleSubmit =
    async (
      event: React.FormEvent
    ) => {
      event.preventDefault();

      const subjectOfferingId =
        subjectIdFromRoute ??
        Number(
          formData.subject
        );

      if (
        !subjectOfferingId
      ) {
        alert(
          "Please select a subject."
        );
        return;
      }

      if (
        !formData.title.trim()
      ) {
        alert(
          "Quiz title is required."
        );
        return;
      }

      if (
        !formData.open_time ||
        !formData.close_time
      ) {
        alert(
          "Open and close times are required."
        );
        return;
      }

      const openDate =
        new Date(
          formData.open_time
        );

      const closeDate =
        new Date(
          formData.close_time
        );

      if (
        Number.isNaN(
          openDate.getTime()
        ) ||
        Number.isNaN(
          closeDate.getTime()
        )
      ) {
        alert(
          "Invalid quiz schedule."
        );
        return;
      }

      if (
        closeDate <=
        openDate
      ) {
        alert(
          "Close time must be after open time."
        );
        return;
      }

      if (
        formData.time_limit <=
        0
      ) {
        alert(
          "Time limit must be greater than 0."
        );
        return;
      }

      if (
        formData.total_points <=
        0
      ) {
        alert(
          "Total points must be greater than 0."
        );
        return;
      }

      if (
        formData.passing_score <
          0 ||
        formData.passing_score >
          formData.total_points
      ) {
        alert(
          "Passing score must be between 0 and total points."
        );
        return;
      }

      try {
        const result =
          await createQuiz.mutateAsync(
            {
              SubjectOffering:
                subjectOfferingId,

              title:
                formData.title.trim(),

              description:
                formData.description.trim(),

              open_time:
                openDate.toISOString(),

              close_time:
                closeDate.toISOString(),

              time_limit:
                formData.time_limit,

              semester:
                formData.semester,

              total_points:
                formData.total_points,

              passing_score:
                formData.passing_score,

              status:
                formData.status,

              show_correct_answers:
                formData.show_correct_answers,

              shuffle_questions:
                formData.shuffle_questions,

              allow_multiple_attempts:
                formData.allow_multiple_attempts,
            }
          );

        if (result.id) {
          navigate(
            `/teacher/activities/${result.id}`
          );

          return;
        }

        navigate(
          cancelPath
        );
      } catch (error) {
        console.error(
          "Error creating quiz:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Failed to create activity."
        );
      }
    };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
          Teacher
        </div>

        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
          Create New Activity
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Create a quiz for one
          of your subject
          offerings.
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6"
      >
        {/* Subject */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Subject *
          </label>

          {subjectIdFromRoute ? (
            <div>
              <div className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
                {selectedSubjectName ??
                  (loadingSubjects
                    ? "Loading subject..."
                    : `Subject #${subjectIdFromRoute}`)}
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Subject is fixed
                because you are
                creating this
                activity inside a
                subject.
              </p>
            </div>
          ) : subjectsError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <div className="text-sm font-bold text-rose-700">
                Unable to load
                subjects.
              </div>

              <div className="mt-1 text-xs text-rose-600">
                {subjectsErrorData instanceof
                Error
                  ? subjectsErrorData.message
                  : "Something went wrong."}
              </div>

              <button
                type="button"
                onClick={() =>
                  refetchSubjects()
                }
                className="mt-3 text-sm font-bold text-rose-700 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <select
              required
              value={
                formData.subject
              }
              onChange={(
                event
              ) =>
                setFormData(
                  (
                    prev
                  ) => ({
                    ...prev,

                    subject:
                      event
                        .target
                        .value,
                  })
                )
              }
              disabled={
                loadingSubjects
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
            >
              <option value="">
                {loadingSubjects
                  ? "Loading subjects..."
                  : "Select Subject"}
              </option>

              {subjects.map(
                (
                  subject
                ) => (
                  <option
                    key={
                      subject.id
                    }
                    value={
                      subject.id
                    }
                  >
                    {
                      subject.name
                    }
                  </option>
                )
              )}
            </select>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Quiz Title *
          </label>

          <input
            type="text"
            required
            value={
              formData.title
            }
            onChange={(
              event
            ) =>
              setFormData(
                (
                  prev
                ) => ({
                  ...prev,

                  title:
                    event
                      .target
                      .value,
                })
              )
            }
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Midterm Exam - Algebra"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Description
          </label>

          <textarea
            value={
              formData.description
            }
            onChange={(
              event
            ) =>
              setFormData(
                (
                  prev
                ) => ({
                  ...prev,

                  description:
                    event
                      .target
                      .value,
                })
              )
            }
            rows={3}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Quiz instructions or description"
          />
        </div>

        {/* Times */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Open Time *
            </label>

            <input
              type="datetime-local"
              required
              value={
                formData.open_time
              }
              onChange={(
                event
              ) =>
                setFormData(
                  (
                    prev
                  ) => ({
                    ...prev,

                    open_time:
                      event
                        .target
                        .value,
                  })
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Close Time *
            </label>

            <input
              type="datetime-local"
              required
              value={
                formData.close_time
              }
              onChange={(
                event
              ) =>
                setFormData(
                  (
                    prev
                  ) => ({
                    ...prev,

                    close_time:
                      event
                        .target
                        .value,
                  })
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Time Limit
              (minutes)
            </label>

            <input
              type="number"
              min={1}
              value={
                formData.time_limit
              }
              onChange={(
                event
              ) =>
                setFormData(
                  (
                    prev
                  ) => ({
                    ...prev,

                    time_limit:
                      Number(
                        event
                          .target
                          .value
                      ),
                  })
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Semester
            </label>

            <select
              value={
                formData.semester
              }
              onChange={(
                event
              ) =>
                setFormData(
                  (
                    prev
                  ) => ({
                    ...prev,

                    semester:
                      event
                        .target
                        .value as Semester,
                  })
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="SEMESTER_1">
                1st Semester
              </option>

              <option value="SEMESTER_2">
                2nd Semester
              </option>

              <option value="SEMESTER_3">
                3rd Semester
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Passing Score
            </label>

            <input
              type="number"
              min={0}
              max={
                formData.total_points
              }
              value={
                formData.passing_score
              }
              onChange={(
                event
              ) =>
                setFormData(
                  (
                    prev
                  ) => ({
                    ...prev,

                    passing_score:
                      Number(
                        event
                          .target
                          .value
                      ),
                  })
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Total Points */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Total Points
          </label>

          <input
            type="number"
            min={1}
            value={
              formData.total_points
            }
            onChange={(
              event
            ) =>
              setFormData(
                (
                  prev
                ) => ({
                  ...prev,

                  total_points:
                    Number(
                      event
                        .target
                        .value
                    ),
                })
              )
            }
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Status
          </label>

          <select
            value={
              formData.status
            }
            onChange={(
              event
            ) =>
              setFormData(
                (
                  prev
                ) => ({
                  ...prev,

                  status:
                    event
                      .target
                      .value as QuizStatus,
                })
              )
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="DRAFT">
              Draft
              (Not visible to
              students)
            </option>

            <option value="SCHEDULED">
              Scheduled
              (Visible to
              students)
            </option>

            <option value="OPEN">
              Open
              (Available now)
            </option>

            <option value="CLOSED">
              Closed
            </option>
          </select>

          <p className="mt-1 text-xs text-slate-500">
            Scheduled quizzes
            follow the open and
            close times you set.
          </p>
        </div>

        {/* Toggles */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                formData.show_correct_answers
              }
              onChange={(
                event
              ) =>
                setFormData(
                  (
                    prev
                  ) => ({
                    ...prev,

                    show_correct_answers:
                      event
                        .target
                        .checked,
                  })
                )
              }
            />

            <span className="text-sm font-medium text-slate-700">
              Show correct
              answers after
              submission
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                formData.shuffle_questions
              }
              onChange={(
                event
              ) =>
                setFormData(
                  (
                    prev
                  ) => ({
                    ...prev,

                    shuffle_questions:
                      event
                        .target
                        .checked,
                  })
                )
              }
            />

            <span className="text-sm font-medium text-slate-700">
              Shuffle
              questions
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                formData.allow_multiple_attempts
              }
              onChange={(
                event
              ) =>
                setFormData(
                  (
                    prev
                  ) => ({
                    ...prev,

                    allow_multiple_attempts:
                      event
                        .target
                        .checked,
                  })
                )
              }
            />

            <span className="text-sm font-medium text-slate-700">
              Allow multiple
              attempts
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={
              createQuiz.isPending
            }
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createQuiz.isPending
              ? "Creating..."
              : "Create Activity"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                cancelPath
              )
            }
            disabled={
              createQuiz.isPending
            }
            className="px-6 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 font-black hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}