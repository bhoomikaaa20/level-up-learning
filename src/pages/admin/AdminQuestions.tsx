import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Question { id: string; level_id: string; question: string; options: any; correct_answer: string; explanation: string | null; time_seconds: number }
interface Level { id: string; title: string }

const empty = { level_id: "", question: "", options: ["", "", "", ""], correct_answer: "", explanation: "", time_seconds: 30 };

export default function AdminQuestions() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    const [{ data: l }, qq] = await Promise.all([
      supabase.from("levels").select("id, title").order("order_index"),
      filterLevel === "all"
        ? supabase.from("questions").select("*").order("created_at", { ascending: false }).limit(200)
        : supabase.from("questions").select("*").eq("level_id", filterLevel).order("created_at", { ascending: false }),
    ]);
    setLevels(l ?? []);
    setQuestions((qq.data ?? []) as Question[]);
  };
  useEffect(() => { load(); }, [filterLevel]);

  const save = async () => {
    const opts = form.options.map((o: string) => o.trim()).filter(Boolean);
    if (!form.level_id || !form.question.trim() || opts.length < 2 || !form.correct_answer.trim()) {
      return toast.error("Level, question, ≥2 options, and correct answer required");
    }
    if (!opts.includes(form.correct_answer)) return toast.error("Correct answer must match an option");
    const payload = { ...form, options: opts };
    const { error } = editing
      ? await supabase.from("questions").update(payload).eq("id", editing)
      : await supabase.from("questions").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Added");
    setOpen(false); setEditing(null); setForm(empty); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await supabase.from("questions").delete().eq("id", id); load();
  };

  const startEdit = (q: Question) => {
    setEditing(q.id);
    const opts = Array.isArray(q.options) ? q.options : [];
    while (opts.length < 4) opts.push("");
    setForm({ level_id: q.level_id, question: q.question, options: opts, correct_answer: q.correct_answer, explanation: q.explanation ?? "", time_seconds: q.time_seconds });
    setOpen(true);
  };

  return (
    <Card className="arcade-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold">Questions</h3>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {levels.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(empty); } }}>
          <DialogTrigger asChild><Button className="bg-gradient-arcade text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> Add question</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} question</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Level</Label>
                <Select value={form.level_id} onValueChange={(v) => setForm({ ...form, level_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Pick a level" /></SelectTrigger>
                  <SelectContent>{levels.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Question</Label><Textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                {form.options.map((opt: string, i: number) => (
                  <div key={i}>
                    <Label>Option {i + 1}</Label>
                    <Input value={opt} onChange={(e) => { const next = [...form.options]; next[i] = e.target.value; setForm({ ...form, options: next }); }} />
                  </div>
                ))}
              </div>
              <div><Label>Correct answer (must match an option)</Label><Input value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })} /></div>
              <div><Label>Explanation</Label><Input value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} /></div>
              <div><Label>Time (seconds)</Label><Input type="number" value={form.time_seconds} onChange={(e) => setForm({ ...form, time_seconds: +e.target.value })} /></div>
              <Button onClick={save} className="w-full bg-gradient-arcade text-primary-foreground">{editing ? "Save" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {questions.map((q) => (
          <div key={q.id} className="flex items-start justify-between gap-3 rounded-xl bg-muted/30 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{q.question}</div>
              <div className="text-xs text-muted-foreground">✓ {q.correct_answer} · {q.time_seconds}s</div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => startEdit(q)}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => del(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {questions.length === 0 && <p className="py-6 text-center text-muted-foreground">No questions.</p>}
      </div>
    </Card>
  );
}
