// src/App.jsx
import { useState } from "react";
import axios from "axios";

/* ---------- UI helpers ---------- */
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-4 bg-gray-200 rounded w-11/12" />
      <div className="h-4 bg-gray-200 rounded w-10/12" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [form, setForm] = useState({
    main_topic: "",
    specific_problem: "",
    old_methods: "",
    solution: "",
    benefits: "",
  });
  const [loading, setLoading] = useState(false);
  const [introduction, setIntroduction] = useState("");

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const fieldClass =
    "w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white transition";

  async function onGenerate() {
    if (!form.main_topic || !form.specific_problem || !form.solution || !form.benefits) {
      alert("Vui lòng điền ít nhất: Chủ đề, Vấn đề, Giải pháp và Lợi ích.");
      return;
    }
    setLoading(true);
    setIntroduction("");
    try {
      const res = await axios.post("http://localhost:3001/api/generate-intro", form);
      setIntroduction(res.data.introduction);
    } catch (err) {
      console.error(err);
      setIntroduction(
        "Đã xảy ra lỗi khi kết nối đến server.\nHãy kiểm tra server backend và console trình duyệt (F12)."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen bg-gray-100 text-slate-900 grid grid-rows-[auto,1fr]">
      {/* Header */}
      <header className="w-full py-5 px-6 bg-white border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
          AI Introduction Suggester
        </h1>
        <p className="text-slate-500 mt-1">
          Nhập dàn ý bên trái → bấm <b>Generate</b> → xem kết quả bên phải.
        </p>
      </header>

      {/* Main: 2 cột full width + full height */}
      <main className="grid grid-cols-1 lg:grid-cols-2 h-full">
        {/* LEFT */}
        <section className="bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 md:p-8 overflow-y-auto flex-grow">
            <h2 className="text-xl font-semibold text-slate-700 mb-5">Thông tin đầu vào</h2>

            <div className="space-y-4">
              <Field label="Chủ đề chính" hint="Ví dụ: Tạo video 4D từ một ảnh duy nhất cho robot nhận thức không gian.">
                <textarea className={fieldClass} rows={3} value={form.main_topic} onChange={(e) => update("main_topic", e.target.value)} />
              </Field>

              <Field label="Vấn đề cụ thể" hint="Điểm đau/challenge: dữ liệu khan hiếm, chi phí train cao, v.v.">
                <textarea className={fieldClass} rows={3} value={form.specific_problem} onChange={(e) => update("specific_problem", e.target.value)} />
              </Field>

              <Field label="Hạn chế của phương pháp cũ" hint="Ví dụ: cần multi-view, tối ưu lâu, generalize kém…">
                <textarea className={fieldClass} rows={3} value={form.old_methods} onChange={(e) => update("old_methods", e.target.value)} />
              </Field>

              <Field label="Giải pháp đề xuất" hint="Nêu ngắn gọn phương pháp/mô hình bạn đề xuất.">
                <textarea className={fieldClass} rows={3} value={form.solution} onChange={(e) => update("solution", e.target.value)} />
              </Field>

              <Field label="Lợi ích chính" hint="Tốc độ, chính xác, tổng quát, chi phí, tác động…">
                <textarea className={fieldClass} rows={3} value={form.benefits} onChange={(e) => update("benefits", e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="p-6 md:p-8 border-t bg-gray-50">
            <button
              onClick={onGenerate}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg
                         !bg-blue-500 !text-white font-semibold hover:!bg-blue-800
                         disabled:opacity-60 transition-colors"
            >
              {loading ? "Đang tạo..." : "✨ Generate Introduction"}
            </button>
          </div>
        </section>

        {/* RIGHT */}
        <section className="bg-white flex flex-col">
          <div className="p-6 md:p-8 border-b">
            <h2 className="text-xl font-semibold text-slate-700">Kết quả gợi ý</h2>
            <p className="text-slate-500 text-sm">Đây là đoạn Introduction hoàn chỉnh do AI viết.</p>
          </div>

          <div className="p-6 md:p-8 flex-grow overflow-y-auto">
            {loading ? (
              <Skeleton />
            ) : introduction ? (
              <article className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed">{introduction}</p>
              </article>
            ) : (
              <div className="h-full min-h-[220px] flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-center text-slate-500">
                Kết quả sẽ xuất hiện ở đây sau khi bạn bấm <b>Generate</b>.
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 border-t bg-gray-50 flex items-center gap-3">
            <button
              disabled={!introduction || loading}
              onClick={() => navigator.clipboard.writeText(introduction)}
              className="px-4 py-2 rounded-lg !bg-gray-200 !text-slate-700 hover:!bg-gray-300
                         border border-gray-300 disabled:opacity-50 transition-colors"
            >
              Copy
            </button>

            <button
              disabled={!introduction || loading}
              onClick={() => {/* TODO: emit sang editor */}}
              className="px-4 py-2 rounded-lg !bg-emerald-600 !text-white hover:!bg-emerald-700
                         disabled:opacity-50 transition-colors"
            >
              Insert vào Editor
            </button>

            <button
              disabled={loading || !introduction}
              onClick={onGenerate}
              className="ml-auto px-4 py-2 rounded-lg !bg-slate-800 !text-white hover:!bg-slate-900
                         disabled:opacity-50 transition-colors"
            >
              Regenerate
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
