import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Loader2, ChevronRight } from "lucide-react";

interface Subject {
  id: string;
  title: string;
  description: string | null;
  icon: string;
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("subjects").select("*").order("title");
      setSubjects(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Pick your <span className="text-gradient">quest</span></h1>
          <p className="mt-2 text-muted-foreground">Choose a subject to start leveling up.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s, i) => (
              <Link key={s.id} to={`/subject/${s.id}`}>
                <Card className="arcade-card group relative overflow-hidden p-6 transition-all hover:scale-[1.02] hover:glow-primary">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-arcade opacity-10 blur-2xl transition-opacity group-hover:opacity-20" />
                  <div className="text-5xl mb-4 animate-float" style={{ animationDelay: `${i * 0.2}s` }}>{s.icon}</div>
                  <h3 className="text-2xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">3 levels</span>
                    <ChevronRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
