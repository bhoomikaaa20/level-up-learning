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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminContent() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [subjOpen, setSubjOpen] = useState(false);
  const [lvOpen, setLvOpen] = useState(false);

  const [newSubj, setNewSubj] = useState({
    title: "",
    description: "",
    icon: "📚"
  });

  const [newLv, setNewLv] = useState({
    subject_id: "",
    tier: "Beginner",
    title: "",
    unlock_coins: 0,
    xp_reward: 50
  });

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

  const addSubject = async () => {
    if (!newSubj.title.trim()) return toast.error("Title required");

    await axios.post(
      "http://localhost:5000/api/admin/subject",
      newSubj,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Subject added");
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

  const addLevel = async () => {
    if (!newLv.subject_id || !newLv.title.trim()) {
      return toast.error("Fill all fields");
    }

    const order_index =
      newLv.tier === "Beginner" ? 1 :
        newLv.tier === "Intermediate" ? 2 : 3;

    await axios.post(
      "http://localhost:5000/api/admin/level",
      { ...newLv, order_index },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Level added");
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
        <h3 className="mb-4 text-xl font-bold">Subjects</h3>

        {subjects.map((s) => (
          <div key={s._id} className="flex justify-between p-3">
            <span>{s.title}</span>
            <Button onClick={() => delSubject(s._id)}>
              <Trash2 />
            </Button>
          </div>
        ))}
      </Card>

      {/* LEVELS */}
      <Card className="arcade-card p-6">
        <h3 className="mb-4 text-xl font-bold">Levels</h3>

        {levels.map((l) => (
          <div key={l._id} className="flex justify-between p-3">
            <span>{l.title}</span>
            <Button onClick={() => delLevel(l._id)}>
              <Trash2 />
            </Button>
          </div>
        ))}
      </Card>
    </div>
  );
}