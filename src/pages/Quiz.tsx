import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, Trophy, Coins, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  time_seconds: number;
}

interface LevelInfo { id: string; title: string; xp_reward: number }

export default function Quiz() {
  const { levelId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [level, setLevel] = useState<LevelInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(30);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<{ xp: number; coins: number; score: number } | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!levelId) return;
    (async () => {
      const [{ data: lv }, { data: qs }] = await Promise.all([
        supabase.from("levels").select("id, title, xp_reward").eq("id", levelId).maybeSingle(),
        supabase.from("questions").select("*").eq("level_id", levelId),
      ]);
      setLevel(lv as LevelInfo);
      // shuffle
      const shuffled = (qs ?? []).map((q) => ({ ...q, options: q.options as string[] })).sort(() => Math.random() - 0.5);
      setQuestions(shuffled as Question[]);
      setTime(shuffled[0]?.time_seconds ?? 30);
      setLoading(false);
    })();
  }, [levelId]);

  const current = questions[idx];

  // Timer
  useEffect(() => {
    if (loading || done || answered || !current) return;
    timerRef.current = window.setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          window.clearInterval(timerRef.current!);
          handleAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [idx, answered, loading, done, current]);

  const handleAnswer = (choice: string | null) => {
    if (answered) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    setAnswered(true);
    setSelected(choice);
    const isCorrect = choice === current.correct_answer;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const next = async () => {
    if (idx + 1 < questions.length) {
      setIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
      setTime(questions[idx + 1].time_seconds ?? 30);
    } else {
      await finish();
    }
  };

  const finish = async () => {
    if (!user || !level) return;
    setDone(true);
    const total = questions.length;
    const score = Math.round((correctCount / total) * 100);
    // Base XP scaled by accuracy + streak bonus 5xp per chain
    const baseXp = Math.round(level.xp_reward * (correctCount / total));
    const bonus = streak >= 3 ? 25 : 0;
    const xp = baseXp + bonus;
    const coins = Math.round(score / 10) * 5; // up to 50

    // Save progress
    await supabase.from("progress").insert({
      user_id: user.id,
      level_id: level.id,
      score,
      total_questions: total,
      correct_count: correctCount,
      xp_earned: xp,
      completed: score >= 60,
    });

    // Award XP & coins
    await supabase.rpc("award_xp_and_coins", { _xp: xp, _coins: coins });

    // Award badges
    await tryAwardBadges(score >= 60);

    setSummary({ xp, coins, score });
  };

  const tryAwardBadges = async (passed: boolean) => {
    if (!user || !level) return;
    // first quiz
    const { count } = await supabase.from("progress").select("*", { count: "exact", head: true }).eq("user_id", user.id);
    if ((count ?? 0) <= 1) await awardBadge("first_quiz");
    if (!passed) return;
    // tier badges
    const { data: lvData } = await supabase.from("levels").select("tier").eq("id", level.id).maybeSingle();
    if (lvData?.tier === "Beginner") await awardBadge("beginner_master");
    if (lvData?.tier === "Intermediate") await awardBadge("intermediate_master");
    if (lvData?.tier === "Advanced") await awardBadge("advanced_master");
    // xp & streak
    const { data: prof } = await supabase.from("profiles").select("xp, streak").eq("id", user.id).maybeSingle();
    if ((prof?.xp ?? 0) >= 1000) await awardBadge("xp_1000");
    if ((prof?.streak ?? 0) >= 7) await awardBadge("streak_7");
  };

  const awardBadge = async (code: string) => {
    if (!user) return;
    const { data: badge } = await supabase.from("badges").select("id, title").eq("code", code).maybeSingle();
    if (!badge) return;
    const { data: existing } = await supabase.from("user_badges").select("id").eq("user_id", user.id).eq("badge_id", badge.id).maybeSingle();
    if (existing) return;
    const { error } = await supabase.from("user_badges").insert({ user_id: user.id, badge_id: badge.id });
    if (!error) toast.success(`🏅 Badge unlocked: ${badge.title}`);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!current && !done) return <div className="container py-20 text-center">No questions yet for this level.</div>;

  if (done && summary) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="container flex flex-col items-center py-16">
          <Card className="arcade-card w-full max-w-md p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-arcade glow-primary animate-pulse-glow">
              <Trophy className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold">Quest complete!</h2>
            <p className="mt-2 text-muted-foreground">{level?.title}</p>
            <div className="my-8 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted p-4">
                <div className="text-2xl font-bold text-gradient">{summary.score}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="rounded-xl bg-gradient-xp p-4 text-accent-foreground">
                <div className="text-2xl font-bold">+{summary.xp}</div>
                <div className="text-xs">XP</div>
              </div>
              <div className="rounded-xl bg-gradient-coin p-4 text-warning-foreground">
                <div className="text-2xl font-bold">+{summary.coins}</div>
                <div className="text-xs">Coins</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/home" className="flex-1"><Button variant="outline" className="w-full">Subjects</Button></Link>
              <Link to="/leaderboard" className="flex-1"><Button className="w-full bg-gradient-arcade text-primary-foreground">Leaderboard</Button></Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const timePct = (time / (current.time_seconds || 30)) * 100;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container max-w-2xl py-10">
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {idx + 1} / {questions.length}</span>
          <span className="flex items-center gap-1 text-accent"><Sparkles className="h-3 w-3" /> Streak: {streak}</span>
        </div>
        <Progress value={((idx + 1) / questions.length) * 100} className="mb-6 h-2" />

        <Card className="arcade-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">⏱ {time}s</span>
            <div className="h-1.5 flex-1 ml-4 overflow-hidden rounded-full bg-muted">
              <div className={`h-full transition-all ${time < 5 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${timePct}%` }} />
            </div>
          </div>
          <h2 className="mb-6 text-2xl font-bold">{current.question}</h2>
          <div className="grid gap-3">
            {current.options.map((opt) => {
              const isCorrect = opt === current.correct_answer;
              const isSelected = opt === selected;
              let cls = "border-border bg-muted/40 hover:border-primary hover:bg-primary/10";
              if (answered) {
                if (isCorrect) cls = "border-accent bg-accent/20 text-accent-foreground";
                else if (isSelected) cls = "border-destructive bg-destructive/20";
                else cls = "border-border bg-muted/20 opacity-60";
              }
              return (
                <button
                  key={opt}
                  disabled={answered}
                  onClick={() => handleAnswer(opt)}
                  className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left font-medium transition-all ${cls}`}
                >
                  <span>{opt}</span>
                  {answered && isCorrect && <Check className="h-5 w-5 text-accent" />}
                  {answered && isSelected && !isCorrect && <X className="h-5 w-5 text-destructive" />}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="mt-6 space-y-4">
              {current.explanation && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
                  <span className="font-semibold text-primary">Explanation: </span>{current.explanation}
                </div>
              )}
              <Button onClick={next} className="w-full bg-gradient-arcade font-semibold text-primary-foreground hover:opacity-90">
                {idx + 1 < questions.length ? "Next question" : "Finish"}
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
