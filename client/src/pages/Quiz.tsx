import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, Trophy, Check, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Question {
  _id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  time_seconds: number;
}

interface LevelInfo {
  _id: string;
  title: string;
  xp_reward: number;
}

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
  const [summary, setSummary] = useState<any>(null);

  const timerRef = useRef<number | null>(null);

  // ✅ FETCH QUIZ
  useEffect(() => {
    if (!levelId) return;

    const fetchQuiz = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/quiz/${levelId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        setLevel(res.data.level);

        const shuffled = res.data.questions.sort(
          () => Math.random() - 0.5
        );

        setQuestions(shuffled);
        setTime(shuffled[0]?.time_seconds ?? 30);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [levelId]);

  const current = questions[idx];

  // ✅ TIMER
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

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [idx, answered, loading, done, current]);

  const handleAnswer = (choice: string | null) => {
    if (answered) return;

    if (timerRef.current) window.clearInterval(timerRef.current);

    setAnswered(true);
    setSelected(choice);

    if (choice === current.correct_answer) {
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

  // ✅ SUBMIT QUIZ (FINAL CLEAN)
  const finish = async () => {
    if (!user || !level) return;

    setDone(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/quiz/submit",
        {
          levelId: level._id,
          correctCount,
          totalQuestions: questions.length,
          streak
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setSummary(res.data);

    } catch (err) {
      console.error(err);
      toast.error("Failed to submit quiz");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!current && !done)
    return (
      <div className="container py-20 text-center">
        No questions yet for this level.
      </div>
    );

  if (done && summary) {
    return (
      <div className="min-h-screen">
        <AppHeader />

        <main className="container flex flex-col items-center py-16">
          <Card className="arcade-card w-full max-w-md p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-arcade">
              <Trophy className="h-10 w-10 text-primary-foreground" />
            </div>

            <h2 className="text-3xl font-bold">Quest complete!</h2>

            <div className="my-8 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted p-4">
                <div className="text-2xl font-bold">{summary.score}%</div>
                <div className="text-xs">Accuracy</div>
              </div>

              <div className="rounded-xl bg-gradient-xp p-4">
                <div className="text-2xl font-bold">+{summary.xp}</div>
                <div className="text-xs">XP</div>
              </div>

              <div className="rounded-xl bg-gradient-coin p-4">
                <div className="text-2xl font-bold">+{summary.coins}</div>
                <div className="text-xs">Coins</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/home" className="flex-1">
                <Button variant="outline" className="w-full">Subjects</Button>
              </Link>

              <Link to="/leaderboard" className="flex-1">
                <Button className="w-full">Leaderboard</Button>
              </Link>
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
        <Progress value={((idx + 1) / questions.length) * 100} />

        <Card className="arcade-card p-6">
          <h2 className="mb-6 text-2xl font-bold">
            {current.question}
          </h2>

          <div className="grid gap-3">
            {current.options.map((opt) => (
              <button
                key={opt}
                disabled={answered}
                onClick={() => handleAnswer(opt)}
                className="border p-3 rounded"
              >
                {opt}
              </button>
            ))}
          </div>

          {answered && (
            <Button onClick={next} className="mt-6 w-full">
              {idx + 1 < questions.length ? "Next" : "Finish"}
            </Button>
          )}
        </Card>
      </main>
    </div>
  );
}