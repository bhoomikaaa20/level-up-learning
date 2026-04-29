import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const emptySubject = {
  title: "",
  description: "",
  icon: "📚"
};

const emptyLevel = {
  subject_id: "",
  tier: "Beginner",
  title: "",
  unlock_coins: 0,
  xp_reward: 50
};

export default function AdminContent() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [subjOpen, setSubjOpen] = useState(false);
  const [lvOpen, setLvOpen] = useState(false);

  const [editingSubj, setEditingSubj] = useState<string | null>(null);
  const [editingLv, setEditingLv] = useState<string | null>(null);

  const [newSubj, setNewSubj] = useState(emptySubject);
  const [newLv, setNewLv] = useState(emptyLevel);

  const token = localStorage.getItem("token");

  const load = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubjects(res.data.subjects);
      setLevels(res.data.levels);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  // SUBJECT ACTIONS
  const openSubjectModal = (subj: any = null) => {
    if (subj) {
      setEditingSubj(subj._id);
      setNewSubj({ title: subj.title, description: subj.description || "", icon: subj.icon || "📚" });
    } else {
      setEditingSubj(null);
      setNewSubj(emptySubject);
    }
    setSubjOpen(true);
  };

  const saveSubject = async () => {
    if (!newSubj.title.trim()) return toast.error("Title required");

    await axios.post(
      "http://localhost:5000/api/admin/subject",
      { ...newSubj, id: editingSubj },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success(editingSubj ? "Subject updated" : "Subject added");
    setSubjOpen(false);
    load();
  };

  const delSubject = async (id: string) => {
    await axios.delete(
      `http://localhost:5000/api/admin/subject/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    load();
  };

  // LEVEL ACTIONS
  const openLevelModal = (lv: any = null) => {
    if (lv) {
      setEditingLv(lv._id);
      setNewLv({ 
        subject_id: lv.subject_id || "", 
        tier: lv.tier, 
        title: lv.title, 
        unlock_coins: lv.unlock_coins || 0, 
        xp_reward: lv.xp_reward 
      });
    } else {
      setEditingLv(null);
      setNewLv(emptyLevel);
    }
    setLvOpen(true);
  };

  const saveLevel = async () => {
    if (!newLv.subject_id || !newLv.title.trim()) {
      return toast.error("Fill all fields");
    }

    const order_index =
      newLv.tier === "Beginner" ? 1 :
        newLv.tier === "Intermediate" ? 2 : 3;

    await axios.post(
      "http://localhost:5000/api/admin/level",
      { ...newLv, order_index, id: editingLv },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success(editingLv ? "Level updated" : "Level added");
    setLvOpen(false);
    load();
  };

  const delLevel = async (id: string) => {
    await axios.delete(
      `http://localhost:5000/api/admin/level/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {/* SUBJECTS */}
      <Card className="arcade-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Subjects</h3>
          <Dialog open={subjOpen} onOpenChange={setSubjOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => openSubjectModal()}><Plus className="w-4 h-4 mr-2" /> Add Subject</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSubj ? "Edit Subject" : "Add Subject"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={newSubj.title} onChange={e => setNewSubj({ ...newSubj, title: e.target.value })} placeholder="e.g. Mathematics" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={newSubj.description} onChange={e => setNewSubj({ ...newSubj, description: e.target.value })} placeholder="Brief description..." />
                </div>
                <div className="space-y-2">
                  <Label>Icon (Emoji)</Label>
                  <Input value={newSubj.icon} onChange={e => setNewSubj({ ...newSubj, icon: e.target.value })} placeholder="📚" />
                </div>
                <Button className="w-full" onClick={saveSubject}>Save Subject</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
            No subjects yet. Click 'Add Subject' to create one.
          </div>
        ) : (
          <div className="space-y-2">
            {subjects.map((s) => (
              <div key={s._id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">{s.description}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => openSubjectModal(s)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => delSubject(s._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* LEVELS */}
      <Card className="arcade-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Levels</h3>
          <Dialog open={lvOpen} onOpenChange={setLvOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => openLevelModal()}><Plus className="w-4 h-4 mr-2" /> Add Level</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLv ? "Edit Level" : "Add Level"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={newLv.subject_id} onValueChange={v => setNewLv({ ...newLv, subject_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s._id} value={s._id}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Level Title</Label>
                  <Input value={newLv.title} onChange={e => setNewLv({ ...newLv, title: e.target.value })} placeholder="e.g. Algebra Basics" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select value={newLv.tier} onValueChange={v => setNewLv({ ...newLv, tier: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>XP Reward</Label>
                    <Input type="number" value={newLv.xp_reward} onChange={e => setNewLv({ ...newLv, xp_reward: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Unlock Coins Required</Label>
                  <Input type="number" value={newLv.unlock_coins} onChange={e => setNewLv({ ...newLv, unlock_coins: Number(e.target.value) })} />
                </div>
                <Button className="w-full" onClick={saveLevel}>Save Level</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {levels.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
            No levels yet. Click 'Add Level' to create one.
          </div>
        ) : (
          <div className="space-y-2">
            {levels.map((l) => {
              const subj = subjects.find(s => s._id === l.subject_id);
              return (
                <div key={l._id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <div className="font-medium">{l.title}</div>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="text-muted-foreground">{subj?.title || 'Unknown Subject'}</span>
                      <span className="px-1.5 bg-primary/10 text-primary rounded">{l.tier}</span>
                      <span className="text-accent">{l.xp_reward} XP</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openLevelModal(l)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => delLevel(l._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}