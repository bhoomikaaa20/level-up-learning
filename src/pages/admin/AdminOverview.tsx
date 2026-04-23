import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export default function AdminOverview() {
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("display_name, xp, coins, streak").order("xp", { ascending: false }).limit(10);
      setTopPlayers(data ?? []);
    })();
  }, []);
  return (
    <Card className="arcade-card p-6">
      <h3 className="mb-4 text-xl font-bold">🏆 Top performers</h3>
      <div className="divide-y divide-border/50">
        {topPlayers.map((p, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="w-6 text-sm font-bold text-muted-foreground">#{i + 1}</span>
              <span className="font-medium">{p.display_name}</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-accent">{p.xp} XP</span>
              <span className="text-warning">{p.coins} coins</span>
              <span className="text-destructive">🔥 {p.streak}</span>
            </div>
          </div>
        ))}
        {topPlayers.length === 0 && <p className="py-6 text-muted-foreground">No players yet.</p>}
      </div>
    </Card>
  );
}
