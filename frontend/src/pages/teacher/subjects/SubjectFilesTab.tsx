import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Upload, FileText, Trash2, Download, Eye, X } from "lucide-react";

type OfferingFile = {
  id: number;
  title: string;
  file_url: string;
  file_size: number;
  content_type: string;
  created_at: string;
};

const MAX_MB = 10;

// keep in sync with backend allowed extensions
const ACCEPT = [
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
  ".png,.jpg,.jpeg,.webp",
  ".txt,.csv",
].join(",");

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
  const lower = url.toLowerCase();
  if (ct.startsWith("image/")) return "image";
  if (ct === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (lower.match(/\.(png|jpg|jpeg|webp)$/)) return "image";
  return null;
}

export default function SubjectFilesTab() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id || 0);
  const token = localStorage.getItem("access");

  const [files, setFiles] = useState<OfferingFile[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<{ kind: "pdf" | "image"; url: string; title: string } | null>(null);

  const base = "http://127.0.0.1:8000/api";

  const loadFiles = async () => {
    if (!token || !subjectId) return;
    try {
      setLoading(true);
      const res = await fetch(`${base}/subject-offerings/${subjectId}/files/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
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
  }, [subjectId, token]);

  const handleUpload = async () => {
    const f = fileInputRef.current?.files?.[0];
    if (!f) return alert("Please choose a file first.");
    if (!token) return alert("Not authenticated.");

    // client-side size hint (backend still enforces)
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_MB) {
      return alert(`File too large. Max is ${MAX_MB}MB.`);
    }

    const form = new FormData();
    form.append("file", f);
    form.append("title", title.trim() || f.name);

    try {
      setUploading(true);
      const res = await fetch(`${base}/subject-offerings/${subjectId}/files/upload/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Upload failed:", err);
        alert(err?.detail || "Upload failed.");
        return;
      }

      const created = (await res.json()) as OfferingFile;
      setFiles((prev) => [created, ...prev]);
      setTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      console.error(e);
      alert("Network error during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!token) return alert("Not authenticated.");
    const ok = window.confirm("Delete this file? This cannot be undone.");
    if (!ok) return;

    try {
      const res = await fetch(`${base}/subject-offerings/${subjectId}/files/${fileId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        console.error("Delete failed:", err);
        alert(err?.detail || "Failed to delete.");
        return;
      }

      setFiles((prev) => prev.filter((x) => x.id !== fileId));
    } catch (e) {
      console.error(e);
      alert("Network error during delete.");
    }
  };

  const emptyState = useMemo(() => files.length === 0 && !loading, [files.length, loading]);

  if (loading) return <div className="p-6">Loading files…</div>;

  return (
    <>
      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="font-black text-slate-900 truncate">{preview.title}</div>
              <button
                onClick={() => setPreview(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                title="Close"
              >
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: FILE LIST */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="p-6 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Files ({files.length})
            </h2>

            <button
              type="button"
              onClick={loadFiles}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Refresh
            </button>
          </div>

          {emptyState ? (
            <div className="px-6 pb-6 text-slate-600">No files uploaded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {files.map((f) => {
                const kind = isPreviewable(f.content_type || "", f.file_url || "");
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

                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: UPLOAD PANEL */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">
            Upload File
          </h3>

          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Title (optional)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g., Week 1 Handout"
          />

          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">
            Choose File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="w-full text-sm"
          />

          <p className="text-xs text-slate-500 mt-2">
            Allowed: PDF, Word, Excel, PPT, images, TXT, CSV • Max {MAX_MB}MB
          </p>

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full mt-5 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-60"
          >
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </>
  );
}
