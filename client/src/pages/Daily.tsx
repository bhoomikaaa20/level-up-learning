import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Flame, Sparkles, Coins, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function Daily() {
  const { user } = useAuth();

  const [challenge, setChallenge] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchDaily = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/daily", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setChallenge(res.data.challenge);
        setCompleted(res.data.completed);
        setQuestions(res.data.questions);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDaily();
  }, [user]);

  const current = questions[idx];

  const handleAnswer = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.correct_answer) setCorrect(c => c + 1);
  };

  const next = async () => {
    if (idx + 1 < questions.length) {
      setIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const token = localStorage.getItem("token");

      const score = Math.round((correct / questions.length) * 100);

      const res = await axios.post(
        "http://localhost:5000/api/daily/submit",
        {
          challengeId: challenge._id,
          score
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`+${res.data.xp} XP & +${res.data.coins} coins!`);

      setDone(true);
      setCompleted(true);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="container max-w-2xl py-10">
        <div className="mb-6 flex items-center gap-3">
          <Flame className="h-10 w-10 text-destructive" />
          <div>
            <h1 className="text-4xl font-bold">
              Daily <span className="text-gradient">challenge</span>
            </h1>
            <p className="text-muted-foreground">
              Resets every 24h. Big bonus rewards.
            </p>
          </div>
        </div>

        {!challenge ? (
          <Card className="arcade-card p-8 text-center">
            No challenge available today.
          </Card>
        ) : completed && !done ? (
          <Card className="arcade-card p-8 text-center">
            <h2 className="text-2xl font-bold">Already done today!</h2>
          </Card>
        ) : done ? (
          <Card className="arcade-card p-8 text-center">
            <h2 className="text-3xl font-bold">Daily complete!</h2>
          </Card>
        ) : current ? (
          <Card className="arcade-card p-6">
            <h2 className="mb-6 text-2xl font-bold">
              {current.question}
            </h2>

            <div className="grid gap-3">
              {current.options.map((opt: string) => {
                const isCorrect = opt === current.correct_answer;
                const isSelected = opt === selected;

                let cls =
                  "border-border bg-muted/40 hover:border-primary";

                if (answered) {
                  if (isCorrect) cls = "border-accent bg-accent/20";
                  else if (isSelected)
                    cls = "border-destructive bg-destructive/20";
                }

                return (
                  <button
                    key={opt}
                    disabled={answered}
                    onClick={() => handleAnswer(opt)}
                    className={`rounded-xl border-2 px-4 py-3 ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {answered && (
              <Button onClick={next} className="mt-6 w-full">
                Next
              </Button>
            )}
          </Card>
        ) : null}
      </main>
    </div>
  );
}