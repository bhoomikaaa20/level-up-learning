import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Trophy, Crown, Medal } from "lucide-react";

export default function Leaderboard() {
  const { user } = useAuth();

  const [global, setGlobal] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [g, w] = await Promise.all([
          axios.get("http://localhost:5000/api/leaderboard/global"),
          axios.get("http://localhost:5000/api/leaderboard/weekly")
        ]);

        setGlobal(g.data);
        setWeekly(w.data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="container py-10">
        <div className="mb-8 flex items-center gap-3">
          <Trophy className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">
              Leader<span className="text-gradient">board</span>
            </h1>
            <p className="text-muted-foreground">
              Climb the ranks. Become legend.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="global">
            <TabsList>
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="weekly">This week</TabsTrigger>
            </TabsList>

            <TabsContent value="global" className="mt-6">
              <Card className="arcade-card overflow-hidden">
                {global.map((row, i) => (
                  <Row
                    key={row.id}
                    rank={i + 1}
                    name={row.display_name}
                    value={row.xp}
                    suffix="XP"
                    highlight={row.id === user?._id}
                  />
                ))}
              </Card>
            </TabsContent>

            <TabsContent value="weekly" className="mt-6">
              <Card className="arcade-card overflow-hidden">
                {weekly.map((row, i) => (
                  <Row
                    key={row.user_id}
                    rank={i + 1}
                    name={row.display_name}
                    value={row.weekly_xp}
                    suffix="XP"
                    highlight={row.user_id === user?._id}
                  />
                ))}
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function Row({ rank, name, value, suffix, highlight }: any) {
  const medal =
    rank === 1 ? <Crown className="h-5 w-5 text-warning" /> :
      rank === 2 ? <Medal className="h-5 w-5 text-muted-foreground" /> :
        rank === 3 ? <Medal className="h-5 w-5 text-secondary" /> :
          null;

  return (
    <div className={`flex items-center justify-between border-b border-border/50 px-5 py-3 ${highlight ? "bg-primary/10" : ""}`}>
      <div className="flex items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm font-bold">
          {medal ?? rank}
        </div>
        <span className="font-medium">{name}</span>
        {highlight && <span className="text-xs text-primary">(you)</span>}
      </div>

      <div className="font-bold text-gradient">
        {value} {suffix}
      </div>
    </div>
  );
}