import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Subject { id: string; title: string; description: string | null; icon: string }
interface Level { id: string; subject_id: string; tier: string; title: string; unlock_coins: number; xp_reward: number; order_index: number }

export default function AdminContent() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjOpen, setSubjOpen] = useState(false);
  const [lvOpen, setLvOpen] = useState(false);
  const [newSubj, setNewSubj] = useState({ title: "", description: "", icon: "📚" });
  const [newLv, setNewLv] = useState({ subject_id: "", tier: "Beginner", title: "", unlock_coins: 0, xp_reward: 50 });

  const load = async () => {
    const [{ data: s }, { data: l }] = await Promise.all([
      supabase.from("subjects").select("*").order("title"),
      supabase.from("levels").select("*").order("order_index"),
    ]);
    setSubjects(s ?? []);
    setLevels((l ?? []) as Level[]);
  };
  useEffect(() => { load(); }, []);

  const addSubject = async () => {
    if (!newSubj.title.trim()) return toast.error("Title required");
    const { error } = await supabase.from("subjects").insert(newSubj);
    if (error) return toast.error(error.message);
    toast.success("Subject added"); setSubjOpen(false); setNewSubj({ title: "", description: "", icon: "📚" }); load();
  };
  const delSubject = async (id: string) => {
    if (!confirm("Delete subject and all its levels/questions?")) return;
    await supabase.from("subjects").delete().eq("id", id); load();
  };
  const addLevel = async () => {
    if (!newLv.subject_id || !newLv.title.trim()) return toast.error("Subject + title required");
    const order_index = newLv.tier === "Beginner" ? 1 : newLv.tier === "Intermediate" ? 2 : 3;
    const { error } = await supabase.from("levels").insert({ ...newLv, order_index, tier: newLv.tier as any });
    if (error) return toast.error(error.message);
    toast.success("Level added"); setLvOpen(false); setNewLv({ subject_id: "", tier: "Beginner", title: "", unlock_coins: 0, xp_reward: 50 }); load();
  };
  const delLevel = async (id: string) => {
    if (!confirm("Delete this level and its questions?")) return;
    await supabase.from("levels").delete().eq("id", id); load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="arcade-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Subjects</h3>
          <Dialog open={subjOpen} onOpenChange={setSubjOpen}>
            <DialogTrigger asChild><Button size="sm" className="bg-gradient-arcade text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> Add</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New subject</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={newSubj.title} onChange={(e) => setNewSubj({ ...newSubj, title: e.target.value })} /></div>
                <div><Label>Icon (emoji)</Label><Input value={newSubj.icon} onChange={(e) => setNewSubj({ ...newSubj, icon: e.target.value })} /></div>
                <div><Label>Description</Label><Input value={newSubj.description} onChange={(e) => setNewSubj({ ...newSubj, description: e.target.value })} /></div>
                <Button onClick={addSubject} className="w-full bg-gradient-arcade text-primary-foreground">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-2">
          {subjects.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-3"><span className="text-2xl">{s.icon}</span><div><div className="font-medium">{s.title}</div><div className="text-xs text-muted-foreground">{s.description}</div></div></div>
              <Button size="icon" variant="ghost" onClick={() => delSubject(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="arcade-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Levels</h3>
          <Dialog open={lvOpen} onOpenChange={setLvOpen}>
            <DialogTrigger asChild><Button size="sm" className="bg-gradient-arcade text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> Add</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New level</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Subject</Label>
                  <Select value={newLv.subject_id} onValueChange={(v) => setNewLv({ ...newLv, subject_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Pick a subject" /></SelectTrigger>
                    <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Tier</Label>
                  <Select value={newLv.tier} onValueChange={(v) => setNewLv({ ...newLv, tier: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Title</Label><Input value={newLv.title} onChange={(e) => setNewLv({ ...newLv, title: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Unlock coins</Label><Input type="number" value={newLv.unlock_coins} onChange={(e) => setNewLv({ ...newLv, unlock_coins: +e.target.value })} /></div>
                  <div><Label>XP reward</Label><Input type="number" value={newLv.xp_reward} onChange={(e) => setNewLv({ ...newLv, xp_reward: +e.target.value })} /></div>
                </div>
                <Button onClick={addLevel} className="w-full bg-gradient-arcade text-primary-foreground">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-2">
          {levels.map((l) => {
            const subj = subjects.find((s) => s.id === l.subject_id);
            return (
              <div key={l.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                <div><div className="font-medium">{l.title}</div><div className="text-xs text-muted-foreground">{subj?.title} · {l.tier} · {l.xp_reward}XP</div></div>
                <Button size="icon" variant="ghost" onClick={() => delLevel(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
