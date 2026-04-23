import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Flame, Sparkles, Coins, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Question { id: string; question: string; options: string[]; correct_answer: string; explanation: string | null }
interface Challenge { id: string; challenge_date: string; question_ids: string[]; bonus_xp: number; bonus_coins: number }

export default function Daily() {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      let { data: ch } = await supabase.from("daily_challenges").select("*").eq("challenge_date", today).maybeSingle();

      // Auto-generate today's challenge if missing (client-side fallback so it always works)
      if (!ch) {
        const { data: pool } = await supabase.from("questions").select("id").limit(200);
        if (pool && pool.length >= 3) {
          const ids = [...pool].sort(() => Math.random() - 0.5).slice(0, 5).map((q) => q.id);
          const { data: created } = await supabase
            .from("daily_challenges")
            .insert({ challenge_date: today, question_ids: ids, bonus_xp: 100, bonus_coins: 25 })
            .select()
            .maybeSingle();
          ch = created;
        }
      }
      if (!ch) { setLoading(false); return; }
      setChallenge(ch as Challenge);

      const { data: completion } = await supabase.from("daily_completions").select("id").eq("user_id", user.id).eq("challenge_id", ch.id).maybeSingle();
      if (completion) setCompleted(true);

      const { data: qs } = await supabase.from("questions").select("*").in("id", ch.question_ids);
      setQuestions((qs ?? []).map((q) => ({ ...q, options: q.options as string[] })) as Question[]);
      setLoading(false);
    })();
  }, [user]);

  const current = questions[idx];

  const handleAnswer = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.correct_answer) setCorrect((c) => c + 1);
  };

  const next = async () => {
    if (idx + 1 < questions.length) {
      setIdx((i) => i + 1);
      setSelected(null); setAnswered(false);
    } else {
      // finish
      if (!user || !challenge) return;
      const score = Math.round((correct / questions.length) * 100);
      await supabase.from("daily_completions").insert({ user_id: user.id, challenge_id: challenge.id, score });
      await supabase.rpc("award_xp_and_coins", { _xp: challenge.bonus_xp, _coins: challenge.bonus_coins });
      toast.success(`+${challenge.bonus_xp} XP & +${challenge.bonus_coins} coins!`);
      setDone(true);
      setCompleted(true);
    }
  };

  if (loading) return <div className="min-h-screen"><AppHeader /><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container max-w-2xl py-10">
        <div className="mb-6 flex items-center gap-3">
          <Flame className="h-10 w-10 text-destructive" />
          <div>
            <h1 className="text-4xl font-bold">Daily <span className="text-gradient">challenge</span></h1>
            <p className="text-muted-foreground">Resets every 24h. Big bonus rewards.</p>
          </div>
        </div>

        {!challenge ? (
          <Card className="arcade-card p-8 text-center">No challenge available today. Try again later.</Card>
        ) : completed && !done ? (
          <Card className="arcade-card p-8 text-center">
            <div className="mb-4 text-5xl">✅</div>
            <h2 className="text-2xl font-bold">Already done today!</h2>
            <p className="mt-2 text-muted-foreground">Come back tomorrow for a new challenge.</p>
          </Card>
        ) : done ? (
          <Card className="arcade-card p-8 text-center">
            <div className="mb-4 text-6xl animate-float">🎉</div>
            <h2 className="text-3xl font-bold">Daily complete!</h2>
            <div className="mt-6 flex justify-center gap-3">
              <span className="rounded-xl bg-gradient-xp px-4 py-2 font-bold text-accent-foreground">+{challenge.bonus_xp} XP</span>
              <span className="rounded-xl bg-gradient-coin px-4 py-2 font-bold text-warning-foreground">+{challenge.bonus_coins} coins</span>
            </div>
          </Card>
        ) : current ? (
          <Card className="arcade-card p-6">
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {idx + 1} / {questions.length}</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-accent"><Sparkles className="h-3.5 w-3.5" /> {challenge.bonus_xp} XP</span>
                <span className="flex items-center gap-1 text-warning"><Coins className="h-3.5 w-3.5" /> {challenge.bonus_coins}</span>
              </span>
            </div>
            <h2 className="mb-6 text-2xl font-bold">{current.question}</h2>
            <div className="grid gap-3">
              {current.options.map((opt) => {
                const isCorrect = opt === current.correct_answer;
                const isSelected = opt === selected;
                let cls = "border-border bg-muted/40 hover:border-primary hover:bg-primary/10";
                if (answered) {
                  if (isCorrect) cls = "border-accent bg-accent/20";
                  else if (isSelected) cls = "border-destructive bg-destructive/20";
                  else cls = "border-border bg-muted/20 opacity-60";
                }
                return (
                  <button key={opt} disabled={answered} onClick={() => handleAnswer(opt)}
                    className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left font-medium transition-all ${cls}`}>
                    <span>{opt}</span>
                    {answered && isCorrect && <Check className="h-5 w-5 text-accent" />}
                    {answered && isSelected && !isCorrect && <X className="h-5 w-5 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {answered && (
              <Button onClick={next} className="mt-6 w-full bg-gradient-arcade text-primary-foreground hover:opacity-90">
                {idx + 1 < questions.length ? "Next" : "Finish challenge"}
              </Button>
            )}
          </Card>
        ) : null}
      </main>
    </div>
  );
}
