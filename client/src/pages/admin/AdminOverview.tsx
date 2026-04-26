import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";

export default function AdminOverview() {
  const [topPlayers, setTopPlayers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/top-players",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        setTopPlayers(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchTopPlayers();
  }, []);

  return (
    <Card className="arcade-card p-6">
      <h3 className="mb-4 text-xl font-bold">🏆 Top performers</h3>

      <div className="divide-y divide-border/50">
        {topPlayers.map((p, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="w-6 text-sm font-bold text-muted-foreground">
                #{i + 1}
              </span>
              <span className="font-medium">{p.display_name}</span>
            </div>

            <div className="flex gap-4 text-sm">
              <span className="text-accent">{p.xp} XP</span>
              <span className="text-warning">{p.coins} coins</span>
              <span className="text-destructive">🔥 {p.streak}</span>
            </div>
          </div>
        ))}

        {topPlayers.length === 0 && (
          <p className="py-6 text-muted-foreground">
            No players yet.
          </p>
        )}
      </div>
    </Card>
  );
}