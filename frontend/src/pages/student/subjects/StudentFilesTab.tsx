import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FileText, Download, Eye, X } from "lucide-react";

type OfferingFile = {
  id: number;
  title: string;
  file_url: string;
  file_size: number;
  content_type: string;
  created_at: string;
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let num = bytes;
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024;
    i++;
  }
  return `${num.toFixed(num >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function isPreviewable(ct: string, url: string) {
  const lower = (url || "").toLowerCase();
  if ((ct || "").startsWith("image/")) return "image" as const;
  if (ct === "application/pdf" || lower.endsWith(".pdf")) return "pdf" as const;
  if (lower.match(/\.(png|jpg|jpeg|webp)$/)) return "image" as const;
  return null;
}

export default function StudentFilesTab() {
  const { id } = useParams<{ id: string }>();
  const offeringId = Number(id || 0);
  const token = localStorage.getItem("access");
  const base = "http://127.0.0.1:8000/api";

  const [files, setFiles] = useState<OfferingFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<{ kind: "pdf" | "image"; url: string; title: string } | null>(null);

  const loadFiles = async () => {
    if (!token || !offeringId) return;
    try {
      setLoading(true);
      const res = await fetch(`${base}/student/subject-offerings/${offeringId}/files/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offeringId, token]);

  const emptyState = useMemo(() => files.length === 0 && !loading, [files.length, loading]);

  if (loading) return <div className="p-6">Loading files…</div>;

  return (
    <>
      {preview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="font-black text-slate-900 truncate">{preview.title}</div>
              <button onClick={() => setPreview(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="h-[70vh] bg-slate-50">
              {preview.kind === "image" ? (
                <div className="h-full flex items-center justify-center p-4">
                  <img src={preview.url} alt={preview.title} className="max-h-full max-w-full rounded-xl" />
                </div>
              ) : (
                <iframe title={preview.title} src={preview.url} className="w-full h-full" />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            Files ({files.length})
          </h2>
          <button onClick={loadFiles} className="text-xs font-bold text-indigo-600 hover:underline">
            Refresh
          </button>
        </div>

        {emptyState ? (
          <div className="px-6 pb-6 text-slate-600">No files uploaded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {files.map((f) => {
              const kind = isPreviewable(f.content_type, f.file_url);
              return (
                <div key={f.id} className="p-5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">{f.title}</div>
                      <div className="text-xs text-slate-500">
                        {formatBytes(f.file_size)} • {new Date(f.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {kind ? (
                      <button
                        onClick={() => setPreview({ kind, url: f.file_url, title: f.title })}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Preview"
                      >
                        <Eye size={18} />
                      </button>
                    ) : null}

                    <a
                      href={f.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                      title="Download / Open"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
