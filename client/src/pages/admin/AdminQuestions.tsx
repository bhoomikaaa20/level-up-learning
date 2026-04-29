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
      return toast.error("Fill all required fields");
    }

    if (!opts.includes(form.correct_answer)) {
      return toast.error("Correct answer must exactly match one of the options");
    }

    await axios.post(
      "http://localhost:5000/api/admin/question",
      { ...form, id: editing, options: opts },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success(editing ? "Question updated" : "Question added");

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

  const updateOption = (index: number, val: string) => {
    const newOpts = [...form.options];
    newOpts[index] = val;
    setForm({ ...form, options: newOpts });
  };

  return (
    <Card className="arcade-card p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-bold">Questions</h3>
        
        <div className="flex items-center gap-4">
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map(l => (
                <SelectItem key={l._id} value={l._id}>{l.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
              setEditing(null);
              setForm(empty);
            }
            setOpen(val);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => { setEditing(null); setForm(empty); }}><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Question" : "Add New Question"}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={form.level_id} onValueChange={v => setForm({ ...form, level_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(l => (
                        <SelectItem key={l._id} value={l._id}>{l.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea 
                    value={form.question} 
                    onChange={e => setForm({ ...form, question: e.target.value })} 
                    placeholder="Enter the question..." 
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {form.options.map((opt: string, i: number) => (
                    <div key={i} className="space-y-2">
                      <Label>Option {i + 1}</Label>
                      <Input 
                        value={opt} 
                        onChange={e => updateOption(i, e.target.value)} 
                        placeholder={`Option ${i + 1}...`} 
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Select value={form.correct_answer} onValueChange={v => setForm({ ...form, correct_answer: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the exact correct option" />
                      </SelectTrigger>
                      <SelectContent>
                        {form.options.map((opt: string, i: number) => (
                          opt.trim() && <SelectItem key={i} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Time Limit (Seconds)</Label>
                    <Input 
                      type="number" 
                      value={form.time_seconds} 
                      onChange={e => setForm({ ...form, time_seconds: Number(e.target.value) })} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Explanation (Optional)</Label>
                  <Textarea 
                    value={form.explanation} 
                    onChange={e => setForm({ ...form, explanation: e.target.value })} 
                    placeholder="Explain why the answer is correct..." 
                    rows={2}
                  />
                </div>

                <Button className="w-full mt-4" onClick={save}>Save Question</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
          No questions found. Click 'Add Question' to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const levelTitle = levels.find(l => l._id === q.level_id)?.title;
            return (
              <div key={q._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      {levelTitle || 'Unknown Level'}
                    </span>
                    <span className="text-xs text-muted-foreground">{q.time_seconds}s</span>
                  </div>
                  <h4 className="font-medium text-sm md:text-base mb-2">{q.question}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {q.options.map((opt: string, i: number) => (
                      <div key={i} className={`px-2 py-1 rounded ${opt === q.correct_answer ? 'bg-green-500/10 text-green-600 font-medium' : 'bg-muted'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => startEdit(q)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => del(q._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}