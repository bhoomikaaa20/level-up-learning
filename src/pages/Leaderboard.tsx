import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Trophy, Crown, Medal } from "lucide-react";

interface LeaderRow { id: string; display_name: string; xp: number; avatar_url: string | null }
interface WeeklyRow { user_id: string; display_name: string; weekly_xp: number }

export default function Leaderboard() {
  const { user } = useAuth();
  const [global, setGlobal] = useState<LeaderRow[]>([]);
  const [weekly, setWeekly] = useState<WeeklyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: g } = await supabase
        .from("profiles")
        .select("id, display_name, xp, avatar_url")
        .order("xp", { ascending: false })
        .limit(50);
      setGlobal(g ?? []);

      // Weekly: sum xp_earned in last 7 days from progress
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: prog } = await supabase
        .from("progress")
        .select("user_id, xp_earned, profiles(display_name)")
        .gte("played_at", weekAgo);
      const map = new Map<string, WeeklyRow>();
      (prog ?? []).forEach((p: any) => {
        const cur = map.get(p.user_id);
        if (cur) cur.weekly_xp += p.xp_earned;
        else map.set(p.user_id, { user_id: p.user_id, display_name: p.profiles?.display_name ?? "Player", weekly_xp: p.xp_earned });
      });
      setWeekly(Array.from(map.values()).sort((a, b) => b.weekly_xp - a.weekly_xp).slice(0, 50));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10">
        <div className="mb-8 flex items-center gap-3">
          <Trophy className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Leader<span className="text-gradient">board</span></h1>
            <p className="text-muted-foreground">Climb the ranks. Become legend.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="global">
            <TabsList>
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="weekly">This week</TabsTrigger>
            </TabsList>
            <TabsContent value="global" className="mt-6">
              <Card className="arcade-card overflow-hidden">
                {global.map((row, i) => <Row key={row.id} rank={i + 1} name={row.display_name} value={row.xp} suffix="XP" highlight={row.id === user?.id} />)}
                {global.length === 0 && <p className="p-6 text-muted-foreground">No players yet.</p>}
              </Card>
            </TabsContent>
            <TabsContent value="weekly" className="mt-6">
              <Card className="arcade-card overflow-hidden">
                {weekly.map((row, i) => <Row key={row.user_id} rank={i + 1} name={row.display_name} value={row.weekly_xp} suffix="XP" highlight={row.user_id === user?.id} />)}
                {weekly.length === 0 && <p className="p-6 text-muted-foreground">No activity this week yet.</p>}
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function Row({ rank, name, value, suffix, highlight }: { rank: number; name: string; value: number; suffix: string; highlight?: boolean }) {
  const medal = rank === 1 ? <Crown className="h-5 w-5 text-warning" /> : rank === 2 ? <Medal className="h-5 w-5 text-muted-foreground" /> : rank === 3 ? <Medal className="h-5 w-5 text-orange-400" /> : null;
  return (
    <div className={`flex items-center justify-between border-b border-border/50 px-5 py-3 last:border-b-0 ${highlight ? "bg-primary/10" : ""}`}>
      <div className="flex items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm font-bold">
          {medal ?? rank}
        </div>
        <span className="font-medium">{name}</span>
        {highlight && <span className="text-xs text-primary">(you)</span>}
      </div>
      <div className="font-bold text-gradient">{value} {suffix}</div>
    </div>
  );
}
