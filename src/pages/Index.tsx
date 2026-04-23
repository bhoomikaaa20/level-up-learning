import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Gamepad2, Sparkles, Trophy, Flame, Coins, Shield } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Nav */}
      <header className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-arcade glow-primary">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-gradient">QuestXP</span>
        </Link>
        <Link to="/auth">
          <Button variant="ghost">Log in</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="container relative pt-16 pb-24 text-center">
        <div className="absolute left-1/2 top-1/3 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-10 top-1/4 -z-10 h-72 w-72 rounded-full bg-secondary/20 blur-[100px]" />

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Learn. Level up. Conquer.
        </div>
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
          Turn studying into a <span className="text-gradient">boss fight</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Master Aptitude, DSA & English through arcade-style quizzes. Earn XP, unlock levels,
          climb the leaderboard.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-arcade text-primary-foreground glow-primary hover:opacity-90">
              <Gamepad2 className="mr-2 h-5 w-5" /> Start playing free
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline">
              I have an account
            </Button>
          </Link>
        </div>

        {/* Stats badges */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Sparkles, label: "XP system", color: "text-accent" },
            { icon: Coins, label: "Earn coins", color: "text-warning" },
            { icon: Trophy, label: "Leaderboards", color: "text-primary" },
            { icon: Flame, label: "Daily streaks", color: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="arcade-card flex flex-col items-center gap-2 p-5">
              <s.icon className={`h-7 w-7 ${s.color}`} />
              <span className="text-sm font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <h2 className="mb-12 text-center text-4xl font-bold">
          Built like a <span className="text-gradient">game</span>, made for learning
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Gamepad2, title: "Level-based quests", desc: "Beginner → Intermediate → Advanced. Unlock with coins.", glow: "glow-primary" },
            { icon: Trophy, title: "Live leaderboard", desc: "Battle it out with players worldwide. Weekly resets.", glow: "glow-secondary" },
            { icon: Shield, title: "Daily challenges", desc: "New quiz every day. Big bonus XP & coins.", glow: "glow-accent" },
          ].map((f) => (
            <div key={f.title} className="arcade-card p-6">
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-arcade ${f.glow}`}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-bold">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="container py-10 text-center text-sm text-muted-foreground">
        Built with Lovable Cloud · Press start to begin 🎮
      </footer>
    </div>
  );
};

export default Index;
