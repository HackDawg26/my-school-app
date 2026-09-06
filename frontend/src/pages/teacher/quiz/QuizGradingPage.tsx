'use client';

import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  Users,
  ClipboardCheck,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  Edit3,
  X,
  CalendarClock,
} from 'lucide-react';

import {
  useGradeQuizAnswer,
  useQuizStudentSubmissions,
  useTeacherQuiz,
} from '../../../hooks/useTeacherSubjects';

import type {
  StudentAnswer,
  StudentSubmission,
} from '../../../types/teacherTypes';

function SkeletonLine({ w = 'w-full' }: { w?: string }) {
  return (
    <div
      className={`h-3 ${w} rounded-full bg-slate-200/80 animate-pulse`}
    />
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {label}
            </div>

            <div className="mt-3 text-4xl font-black tracking-tight text-slate-900">
              {value}
            </div>

            <div className="mt-2 text-xs text-slate-500">
              {hint}
            </div>
          </div>

          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDT(
  iso?: string | null
) {
  if (!iso) return '—';

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );
}

function clampNum(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function statusChip(
  status: string
) {
  const normalized =
    (status || '').toUpperCase();

  if (normalized === 'GRADED') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  }

  if (normalized === 'SUBMITTED') {
    return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  }

  return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200';
}

function answerPerfMeta(
  answer: StudentAnswer
) {
  if (answer.is_correct === true) {
    return {
      icon: (
        <CheckCircle2
          size={16}
          className="text-emerald-600"
        />
      ),
      label: 'Correct',
      chip:
        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    };
  }

  if (answer.is_correct === false) {
    return {
      icon: (
        <XCircle
          size={16}
          className="text-rose-600"
        />
      ),
      label: 'Incorrect',
      chip:
        'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    };
  }

  if (answer.manually_graded) {
    return {
      icon: (
        <CheckCircle2
          size={16}
          className="text-emerald-600"
        />
      ),
      label: 'Graded',
      chip:
        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    };
  }

  return {
    icon: (
      <AlertTriangle
        size={16}
        className="text-amber-600"
      />
    ),
    label: 'Needs grading',
    chip:
      'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  };
}

export default function QuizGradingPage() {
  const { id } =
    useParams<{ id: string }>();

  const quizId =
    Number(id || 0);

  const navigate =
    useNavigate();

  const [
    selectedAttemptId,
    setSelectedAttemptId,
  ] =
    useState<number | null>(
      null
    );

  const {
    data: quiz,
    isLoading: quizLoading,
    isError: quizError,
    error: quizErrorData,
    refetch: refetchQuiz,
  } =
    useTeacherQuiz(quizId);

  const {
    data: submissions = [],
    isLoading:
      submissionsLoading,
    isError:
      submissionsError,
    error:
      submissionsErrorData,
    refetch:
      refetchSubmissions,
  } =
    useQuizStudentSubmissions(
      quizId
    );

  const gradeAnswer =
    useGradeQuizAnswer();

  const selectedStudent =
    useMemo(() => {
      if (!submissions.length) {
        return null;
      }

      if (
        selectedAttemptId !==
        null
      ) {
        const found =
          submissions.find(
            (
              submission
            ) =>
              submission.attempt_id ===
              selectedAttemptId
          );

        if (found) {
          return found;
        }
      }

      return submissions[0];
    }, [
      submissions,
      selectedAttemptId,
    ]);

  const stats =
    useMemo(() => {
      const total =
        submissions.length;

      const graded =
        submissions.filter(
          (
            submission
          ) =>
            (
              submission.status ||
              ''
            ).toUpperCase() ===
            'GRADED'
        ).length;

      const pending =
        total - graded;

      return {
        total,
        graded,
        pending,
      };
    }, [submissions]);

  const handleGradeAnswer =
    async (
      answerId: number,
      points: number,
      feedback: string
    ) => {
      await gradeAnswer.mutateAsync({
        quizId,
        answerId,
        points,
        feedback,
      });
    };

  const loading =
    quizLoading ||
    submissionsLoading;

  const hasError =
    quizError ||
    submissionsError;

  if (!quizId) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          Invalid quiz ID.
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-40 rounded-2xl bg-white border border-slate-200 shadow-sm" />

            <div className="flex-1">
              <div className="h-8 w-72 rounded-2xl bg-slate-200/80 animate-pulse" />

              <div className="mt-2 h-3 w-52 rounded-full bg-slate-200/80 animate-pulse" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {Array.from({
              length: 3,
            }).map(
              (
                _,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="rounded-3xl border border-slate-200 bg-white p-6"
                >
                  <SkeletonLine w="w-40" />

                  <div className="mt-5">
                    <SkeletonLine w="w-24" />
                  </div>

                  <div className="mt-3">
                    <SkeletonLine w="w-44" />
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-32" />

              <div className="mt-4 space-y-3">
                <div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            </div>

            <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-48" />

              <div className="mt-4 space-y-3">
                <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (hasError) {
    const errorMessage =
      quizErrorData instanceof
      Error
        ? quizErrorData.message
        : submissionsErrorData instanceof
          Error
        ? submissionsErrorData.message
        : 'Failed to load quiz grading data.';

    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft
              size={16}
            />
            Back
          </button>

          <div className="mt-6 rounded-3xl border border-rose-200 bg-white p-6">
            <div className="text-sm font-black uppercase tracking-widest text-rose-500">
              Error
            </div>

            <div className="mt-2 text-lg font-bold text-slate-900">
              {
                errorMessage
              }
            </div>

            <div className="mt-1 text-sm text-slate-500">
              Try refreshing the
              page.
            </div>

            <button
              type="button"
              onClick={() => {
                refetchQuiz();
                refetchSubmissions();
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600"
            >
              <ClipboardCheck
                size={16}
              />

              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/85 backdrop-blur">
        <div className="mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft
                size={16}
              />

              Back
            </button>

            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                Manual Grading
              </div>

              <h1 className="truncate text-xl md:text-2xl font-black tracking-tight text-slate-900">
                {quiz?.title ??
                  'Quiz'}
              </h1>

              <div className="mt-0.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Total Points:{' '}
                {quiz?.total_points ??
                  '—'}{' '}
                • Submissions:{' '}
                {
                  submissions.length
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={
              <Users
                size={18}
              />
            }
            label="Submissions"
            value={
              stats.total
            }
            hint="Total attempts"
          />

          <StatCard
            icon={
              <CheckCircle2
                size={18}
              />
            }
            label="Graded"
            value={
              stats.graded
            }
            hint="Marked as graded"
          />

          <StatCard
            icon={
              <AlertTriangle
                size={18}
              />
            }
            label="Pending"
            value={
              stats.pending
            }
            hint="Needs review"
          />
        </div>

        {/* Main Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Student List */}
          <aside className="lg:col-span-1">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Students
                </div>

                <div className="mt-1 text-lg font-black text-slate-900">
                  Select
                  submission
                </div>
              </div>

              <div className="max-h-[70vh] overflow-auto p-3 space-y-2">
                {submissions.length ===
                0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No submissions
                    yet.
                  </div>
                ) : (
                  submissions.map(
                    (
                      submission
                    ) => {
                      const active =
                        selectedStudent?.attempt_id ===
                        submission.attempt_id;

                      return (
                        <button
                          key={
                            submission.attempt_id
                          }
                          type="button"
                          onClick={() =>
                            setSelectedAttemptId(
                              submission.attempt_id
                            )
                          }
                          className={[
                            'w-full text-left rounded-2xl border p-4 transition',
                            active
                              ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900',
                          ].join(
                            ' '
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-black truncate">
                                {
                                  submission.student_name
                                }
                              </div>

                              <div
                                className={`mt-1 text-xs ${
                                  active
                                    ? 'text-white/80'
                                    : 'text-slate-500'
                                }`}
                              >
                                Score:{' '}
                                {(
                                  submission.score ??
                                  0
                                ).toFixed(
                                  1
                                )}{' '}
                                /{' '}
                                {quiz?.total_points ??
                                  '—'}
                              </div>
                            </div>

                            <span
                              className={[
                                'shrink-0 inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-black',
                                active
                                  ? 'bg-white/15 text-white'
                                  : statusChip(
                                      submission.status
                                    ),
                              ].join(
                                ' '
                              )}
                            >
                              {(
                                submission.status ||
                                '—'
                              ).toUpperCase()}
                            </span>
                          </div>

                          <div
                            className={`mt-2 flex items-center gap-2 text-xs ${
                              active
                                ? 'text-white/75'
                                : 'text-slate-500'
                            }`}
                          >
                            <CalendarClock
                              size={
                                14
                              }
                            />

                            <span className="truncate">
                              Submitted:{' '}
                              {formatDT(
                                submission.submitted_at
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )
                )}
              </div>
            </div>
          </aside>

          {/* Grading Panel */}
          <section className="lg:col-span-3">
            {!selectedStudent ? (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="text-sm font-black text-slate-900">
                  Select a student
                </div>

                <div className="mt-1 text-sm text-slate-600">
                  Choose a
                  submission from
                  the left to view
                  answers.
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Selected Student Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Selected
                      </div>

                      <div className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                        {
                          selectedStudent.student_name
                        }
                      </div>

                      <div className="mt-1 text-sm text-slate-600">
                        {
                          selectedStudent.student_email
                        }
                      </div>

                      <div className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                        Submitted:{' '}
                        {formatDT(
                          selectedStudent.submitted_at
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Total Score
                        </div>

                        <div className="mt-1 text-xl font-black text-slate-900">
                          {(
                            selectedStudent.score ??
                            0
                          ).toFixed(
                            1
                          )}{' '}
                          <span className="text-sm font-black text-slate-400">
                            /{' '}
                            {quiz?.total_points ??
                              '—'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full px-3 py-2 text-[11px] font-black ${statusChip(
                          selectedStudent.status
                        )}`}
                      >
                        {(
                          selectedStudent.status ||
                          '—'
                        ).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Answers */}
                <div className="p-6 space-y-4">
                  {selectedStudent.answers.map(
                    (
                      answer,
                      index
                    ) => (
                      <AnswerGradingCard
                        key={
                          answer.id
                        }
                        answer={
                          answer
                        }
                        index={
                          index
                        }
                        onGrade={
                          handleGradeAnswer
                        }
                        saving={
                          gradeAnswer.isPending
                        }
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

interface AnswerGradingCardProps {
  answer: StudentAnswer;
  index: number;
  onGrade: (
    answerId: number,
    points: number,
    feedback: string
  ) => Promise<void>;
  saving: boolean;
}

function AnswerGradingCard({
  answer,
  index,
  onGrade,
  saving,
}: AnswerGradingCardProps) {
  const [points, setPoints] =
    useState(
      String(
        answer.points_earned ??
          0
      )
    );

  const [
    feedback,
    setFeedback,
  ] =
    useState(
      answer.teacher_feedback ||
        ''
    );

  const [
    isEditing,
    setIsEditing,
  ] =
    useState(
      !answer.manually_graded
    );

  const meta =
    useMemo(
      () =>
        answerPerfMeta(
          answer
        ),
      [answer]
    );

  const pointsNum =
    useMemo(() => {
      const number =
        parseFloat(
          points
        );

      if (
        !Number.isFinite(
          number
        )
      ) {
        return 0;
      }

      return number;
    }, [points]);

  const maxPoints =
    answer.question_points ??
    0;

  const overMax =
    pointsNum >
    maxPoints;

  const canSave =
    !saving &&
    !overMax &&
    pointsNum >= 0;

  const resetToSaved =
    () => {
      setPoints(
        String(
          answer.points_earned ??
            0
        )
      );

      setFeedback(
        answer.teacher_feedback ||
          ''
      );
    };

  const handleSubmit =
    async () => {
      const safePoints =
        clampNum(
          pointsNum,
          0,
          maxPoints
        );

      try {
        await onGrade(
          answer.id,
          safePoints,
          feedback
        );

        setIsEditing(
          false
        );
      } catch (error) {
        console.error(
          'Failed to save grade:',
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : 'Failed to save grade.'
        );
      }
    };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
      {/* Question Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black ${meta.chip}`}
              >
                {meta.icon}

                {meta.label}
              </div>

              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Question{' '}
                {index + 1}
              </div>

              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Worth{' '}
                {
                  answer.question_points
                }{' '}
                pt
                {answer.question_points !==
                1
                  ? 's'
                  : ''}
              </div>
            </div>

            <div className="mt-2 text-sm font-bold text-slate-900">
              {
                answer.question_text
              }
            </div>
          </div>

          {!isEditing && (
            <div className="flex items-center gap-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Points
                </div>

                <div className="mt-0.5 text-lg font-black text-slate-900">
                  {
                    answer.points_earned
                  }{' '}
                  <span className="text-sm font-black text-slate-400">
                    /{' '}
                    {
                      answer.question_points
                    }
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsEditing(
                    true
                  )
                }
                disabled={
                  saving
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <Edit3
                  size={16}
                />

                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Student Answer */}
      <div className="p-5 bg-slate-50 border-b border-slate-100">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
          Student Answer
        </div>

        {answer.text_answer ? (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 whitespace-pre-wrap">
            {
              answer.text_answer
            }
          </div>
        ) : null}

        {answer.choices &&
        answer.choices.length >
          0 ? (
          <div className="mt-3 space-y-2">
            {[
              ...answer.choices,
            ]
              .sort(
                (a, b) =>
                  a.order -
                  b.order
              )
              .map(
                (
                  choice
                ) => {
                  const isSelected =
                    choice.id ===
                    answer.selected_choice;

                  const isCorrect =
                    choice.id ===
                    answer.correct_choice;

                  let style =
                    'border-slate-200 bg-white';

                  if (
                    isCorrect
                  ) {
                    style =
                      'border-emerald-300 bg-emerald-50';
                  }

                  if (
                    isSelected &&
                    !isCorrect
                  ) {
                    style =
                      'border-rose-300 bg-rose-50';
                  }

                  return (
                    <div
                      key={
                        choice.id
                      }
                      className={`rounded-2xl border p-3 text-sm ${style}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">
                          {
                            choice.choice_text
                          }
                        </span>

                        <div className="flex items-center gap-2 text-xs font-bold">
                          {isSelected && (
                            <span className="text-indigo-600">
                              Student
                              Answer
                            </span>
                          )}

                          {isCorrect && (
                            <span className="text-emerald-600">
                              Correct
                              Answer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
          </div>
        ) : null}

        {answer.answer_file_url ? (
          <div className="mt-3">
            <a
              href={
                answer.answer_file_url
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              <Paperclip
                size={16}
              />

              View uploaded
              file
            </a>
          </div>
        ) : null}

        {!answer.text_answer &&
        !answer.selected_choice &&
        !answer.answer_file_url ? (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            No answer content.
          </div>
        ) : null}
      </div>

      {/* Grading */}
      <div className="p-5">
        {!isEditing &&
        answer.manually_graded ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                Teacher Feedback
              </div>

              {answer.graded_at ? (
                <div className="text-xs text-slate-500">
                  Graded{' '}
                  {formatDT(
                    answer.graded_at
                  )}

                  {answer.graded_by_name
                    ? ` • ${answer.graded_by_name}`
                    : ''}
                </div>
              ) : null}
            </div>

            {answer.teacher_feedback ? (
              <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {
                  answer.teacher_feedback
                }
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-500">
                No feedback
                provided.
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                Points Earned
                (max{' '}
                {
                  answer.question_points
                }
                )
              </div>

              <div className="mt-2">
                <input
                  type="number"
                  min={0}
                  max={
                    answer.question_points
                  }
                  step="0.5"
                  value={
                    points
                  }
                  onChange={(
                    e
                  ) =>
                    setPoints(
                      e.target
                        .value
                    )
                  }
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-sm font-bold outline-none',
                    overMax
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500',
                  ].join(
                    ' '
                  )}
                  disabled={
                    saving
                  }
                />

                <div className="mt-2 text-xs text-slate-500">
                  {overMax ? (
                    <span className="text-rose-600 font-bold">
                      Points cannot
                      exceed max.
                    </span>
                  ) : (
                    <span>
                      Use 0.5 steps
                      if needed.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-8">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                Feedback
                (optional)
              </div>

              <textarea
                value={
                  feedback
                }
                onChange={(
                  e
                ) =>
                  setFeedback(
                    e.target
                      .value
                  )
                }
                rows={3}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Write feedback to the student..."
                disabled={
                  saving
                }
              />
            </div>

            <div className="md:col-span-12 flex flex-wrap items-center justify-end gap-2 pt-1">
              {answer.manually_graded ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(
                      false
                    );

                    resetToSaved();
                  }}
                  disabled={
                    saving
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  <X
                    size={16}
                  />

                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setIsEditing(
                      false
                    )
                  }
                  disabled={
                    saving
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  <X
                    size={16}
                  />

                  Close
                </button>
              )}

              <button
                type="button"
                onClick={
                  handleSubmit
                }
                disabled={
                  !canSave
                }
                className={[
                  'inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black text-white transition',
                  canSave
                    ? 'bg-slate-900 hover:bg-indigo-600'
                    : 'bg-slate-300 cursor-not-allowed',
                ].join(
                  ' '
                )}
              >
                <Save
                  size={16}
                />

                {saving
                  ? 'Saving…'
                  : 'Save Grade'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}