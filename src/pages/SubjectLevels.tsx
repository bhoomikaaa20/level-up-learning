import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Loader2, Lock, Play, Trophy, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Level {
  id: string;
  tier: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  unlock_coins: number;
  xp_reward: number;
  order_index: number;
}

interface Progress { level_id: string; completed: boolean; score: number }

export default function SubjectLevels() {
  const { id } = useParams();
  const { user } = useAuth();
  const [subjectTitle, setSubjectTitle] = useState("");
  const [levels, setLevels] = useState<Level[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      const [{ data: subj }, { data: lv }, { data: prog }, { data: prof }] = await Promise.all([
        supabase.from("subjects").select("title").eq("id", id).maybeSingle(),
        supabase.from("levels").select("*").eq("subject_id", id).order("order_index"),
        supabase.from("progress").select("level_id, completed, score").eq("user_id", user.id),
        supabase.from("profiles").select("coins").eq("id", user.id).maybeSingle(),
      ]);
      setSubjectTitle(subj?.title ?? "");
      setLevels((lv ?? []) as Level[]);
      const map: Record<string, Progress> = {};
      (prog ?? []).forEach((p) => {
        const existing = map[p.level_id];
        if (!existing || p.score > existing.score) map[p.level_id] = p as Progress;
      });
      setProgress(map);
      setCoins(prof?.coins ?? 0);
      setLoading(false);
    })();
  }, [id, user]);

  const tierColor: Record<Level["tier"], string> = {
    Beginner: "bg-accent/20 text-accent border-accent/40",
    Intermediate: "bg-primary/20 text-primary border-primary/40",
    Advanced: "bg-secondary/20 text-secondary border-secondary/40",
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10">
        <Link to="/home" className="text-sm text-muted-foreground hover:text-primary">← Back to subjects</Link>
        <h1 className="mt-3 text-4xl font-bold">{subjectTitle} <span className="text-gradient">levels</span></h1>
        <p className="mt-2 text-muted-foreground">Complete a level to unlock the next tier.</p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="mt-10 grid gap-4">
            {levels.map((lv, i) => {
              const prevDone = i === 0 || progress[levels[i - 1]?.id]?.completed;
              const canAfford = coins >= lv.unlock_coins;
              const locked = !prevDone && !canAfford;
              const done = progress[lv.id]?.completed;
              return (
                <Card key={lv.id} className={`arcade-card flex items-center justify-between p-5 ${locked ? "opacity-60" : "hover:glow-primary"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${done ? "bg-gradient-xp" : "bg-muted"}`}>
                      {locked ? <Lock className="h-6 w-6 text-muted-foreground" /> : done ? <Trophy className="h-6 w-6 text-accent-foreground" /> : <Play className="h-6 w-6 text-primary" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{lv.title}</h3>
                        <Badge variant="outline" className={tierColor[lv.tier]}>{lv.tier}</Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>+{lv.xp_reward} XP</span>
                        {lv.unlock_coins > 0 && <span className="flex items-center gap-1"><Coins className="h-3 w-3" /> {lv.unlock_coins} to unlock</span>}
                        {progress[lv.id] && <span className="text-accent">Best: {progress[lv.id].score}%</span>}
                      </div>
                    </div>
                  </div>
                  {locked ? (
                    <span className="text-xs text-muted-foreground">{prevDone ? "Need more coins" : "Complete previous"}</span>
                  ) : (
                    <Link to={`/quiz/${lv.id}`} className="rounded-xl bg-gradient-arcade px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
                      {done ? "Replay" : "Play"}
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
