import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const empty = {
  level_id: "",
  question: "",
  options: ["", "", "", ""],
  correct_answer: "",
  explanation: "",
  time_seconds: 30
};

export default function AdminQuestions() {
  const [levels, setLevels] = useState<any[]>([]);
  const [filterLevel, setFilterLevel] = useState("all");
  const [questions, setQuestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>(empty);

  const token = localStorage.getItem("token");

  const load = async () => {
    try {
      const [l, q] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/levels", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/admin/questions", {
          params: { levelId: filterLevel },
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setLevels(l.data);
      setQuestions(q.data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, [filterLevel]);

  const save = async () => {
    const opts = form.options.map((o: string) => o.trim()).filter(Boolean);

    if (!form.level_id || !form.question || opts.length < 2 || !form.correct_answer) {
      return toast.error("Fill all fields properly");
    }

    await axios.post(
      "http://localhost:5000/api/admin/question",
      { ...form, id: editing, options: opts },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success(editing ? "Updated" : "Added");

    setOpen(false);
    setEditing(null);
    setForm(empty);
    load();
  };

  const del = async (id: string) => {
    await axios.delete(
      `http://localhost:5000/api/admin/question/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    load();
  };

  const startEdit = (q: any) => {
    setEditing(q._id);

    const opts = [...q.options];
    while (opts.length < 4) opts.push("");

    setForm({
      level_id: q.level_id,
      question: q.question,
      options: opts,
      correct_answer: q.correct_answer,
      explanation: q.explanation || "",
      time_seconds: q.time_seconds
    });

    setOpen(true);
  };

  return (
    <Card className="arcade-card p-6">
      <h3 className="mb-4 text-xl font-bold">Questions</h3>

      {questions.map((q) => (
        <div key={q._id} className="flex justify-between p-3">
          <span>{q.question}</span>

          <div className="flex gap-2">
            <Button onClick={() => startEdit(q)}>
              <Edit />
            </Button>
            <Button onClick={() => del(q._id)}>
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
    </Card>
  );
}