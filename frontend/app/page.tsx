"use client";
import { FaTrash, FaCheck, FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // 1) localStorage'dan yükle (yalnızca client)
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem("tasks") : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Task[];
        if (Array.isArray(parsed)) setTasks(parsed);
      }
    } catch {
      // sessiz geç
    }
  }, []);

  // 2) Değiştikçe localStorage'a yaz
  useEffect(() => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch {
      // sessiz geç
    }
  }, [tasks]);

  // 3) Ekle
  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const title = input.trim();
    if (!title) return;

    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        title,
        completed: false,
      },
    ]);
    setInput("");
  };

  // 4) Tamamla/geri al
  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // 5) Sil
  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // 6) Düzenleme akışı
  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.title);
  };
  const saveEdit = (id: string) => {
    const text = editText.trim();
    if (!text) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: text } : t))
    );
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-6 text-white">
      <div className="max-w-xl mx-auto">
        <div className=" flex items-center text-center justify-center bg-white/10 p-4 rounded">
          <h1 className="text-2xl font-semibold mb-4">Görevler</h1>
        </div>

        {/* Form: submit akışını düzeltir */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Yeni görev..."
            className="flex-1 bg-white/10 mt-6 rounded px-3 py-2 pb-1 text-white focus:outline-none"
          />
          <Button
            type="submit"
            className="bg-white/25 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded mt-6"
            title="Ekle"
          >
            Ekle
          </Button>
        </form>

        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`border rounded px-3 py-2 flex items-center justify-between transition
                ${
                  task.completed
                    ? "bg-emerald-200 text-emerald-900 border-emerald-300"
                    : "bg-slate-100 text-gray-800 border-slate-300"
                }`}
            >
              {editingId === task.id ? (
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => saveEdit(task.id)}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 mr-2"
                  autoFocus
                />
              ) : (
                <span
                  className={`flex-1 ${task.completed ? "line-through" : ""}`}
                >
                  {task.title}
                </span>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="text-green-600 hover:text-green-800"
                  title="Tamamla"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() =>
                    editingId === task.id
                      ? saveEdit(task.id)
                      : startEditing(task)
                  }
                  className="text-yellow-600 hover:text-yellow-800"
                  title="Düzenle"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Sil"
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
