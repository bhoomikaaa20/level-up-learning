import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Sparkles, Coins, Flame, Trophy, Target, Loader2 } from "lucide-react";

interface Profile {
  display_name: string;
  xp: number;
  coins: number;
  streak: number;
}
interface RecentActivity {
  level_id: string;
  score: number;
  xp_earned: number;
  played_at: string;
  level_title?: string;
}
interface BadgeRow { badge_id: string; awarded_at: string; badge: { code: string; title: string; icon: string } }

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completed, setCompleted] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [recent, setRecent] = useState<RecentActivity[]>([]);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setProfile(res.data.profile);
        setCompleted(res.data.completed);
        setAccuracy(res.data.accuracy);
        setRecent(res.data.recent);
        setBadges(res.data.badges);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <div className="min-h-screen"><AppHeader /><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10">
        <h1 className="text-4xl font-bold">Hey, <span className="text-gradient">{profile?.display_name}</span> 👋</h1>
        <p className="mt-2 text-muted-foreground">Here's your quest log.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Sparkles} label="Total XP" value={profile?.xp ?? 0} bg="bg-gradient-xp" fg="text-accent-foreground" />
          <StatCard icon={Coins} label="Coins" value={profile?.coins ?? 0} bg="bg-gradient-coin" fg="text-warning-foreground" />
          <StatCard icon={Flame} label="Streak" value={`${profile?.streak ?? 0} days`} bg="bg-destructive" fg="text-destructive-foreground" />
          <StatCard icon={Target} label="Accuracy" value={`${accuracy}%`} bg="bg-gradient-arcade" fg="text-primary-foreground" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="arcade-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-primary" /> Recent activity</h3>
            {recent.length === 0 ? (
              <p className="text-muted-foreground">No quizzes played yet. Start one!</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((r, i) => (
                  <li key={i} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                    <div>
                      <div className="font-medium">{r.level_title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.played_at).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gradient">{r.score}%</div>
                      <div className="text-xs text-accent">+{r.xp_earned} XP</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="arcade-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">🏅 Badges ({badges.length})</h3>
            {badges.length === 0 ? (
              <p className="text-muted-foreground">No badges yet. Complete a level to earn one!</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {badges.map((b) => (
                  <div key={b.badge_id} className="flex flex-col items-center rounded-xl bg-muted/30 p-3 text-center">
                    <div className="text-3xl">{b.badge.icon}</div>
                    <div className="mt-1 text-[10px] font-medium">{b.badge.title}</div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-muted-foreground">Completed levels: {completed}</p>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, bg, fg }: any) {
  return (
    <Card className={`arcade-card p-5`}>
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${fg}`} />
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </Card>
  );
}
