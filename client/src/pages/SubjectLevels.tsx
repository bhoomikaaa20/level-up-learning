import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Loader2, Lock, Play, Trophy, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SubjectLevels() {
  const { id } = useParams();
  const { user } = useAuth();

  const [subjectTitle, setSubjectTitle] = useState("");
  const [levels, setLevels] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({});
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/subjects/${id}/levels`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        setSubjectTitle(res.data.subjectTitle);
        setLevels(res.data.levels);
        setCoins(res.data.coins);

        // convert progress array → map
        const map: any = {};
        res.data.progress.forEach((p: any) => {
          if (!map[p.level_id] || p.score > map[p.level_id].score) {
            map[p.level_id] = p;
          }
        });

        setProgress(map);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const tierColor: any = {
    Beginner: "bg-accent/20 text-accent border-accent/40",
    Intermediate: "bg-primary/20 text-primary border-primary/40",
    Advanced: "bg-secondary/20 text-secondary border-secondary/40",
  };

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="container py-10">
        <Link to="/home" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to subjects
        </Link>

        <h1 className="mt-3 text-4xl font-bold">
          {subjectTitle} <span className="text-gradient">levels</span>
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-10 grid gap-4">
            {levels.map((lv: any, i: number) => {
              const prevDone = i === 0 || progress[levels[i - 1]?._id]?.completed;
              const canAfford = coins >= lv.unlock_coins;
              const locked = !prevDone && !canAfford;
              const done = progress[lv._id]?.completed;

              return (
                <Card key={lv._id} className={`arcade-card flex justify-between p-5 ${locked ? "opacity-60" : ""}`}>
                  <div>
                    <h3 className="font-bold">{lv.title}</h3>

                    <div className="text-sm text-muted-foreground">
                      +{lv.xp_reward} XP
                    </div>
                  </div>

                  {locked ? (
                    <span>Locked</span>
                  ) : (
                    <Link to={`/quiz/${lv._id}`}>Play</Link>
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