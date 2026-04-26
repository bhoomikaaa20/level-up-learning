import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Users, FolderTree, HelpCircle, BarChart3 } from "lucide-react";

export default function AdminLayout() {
  const { pathname } = useLocation();

  const [stats, setStats] = useState({
    users: 0,
    subjects: 0,
    questions: 0,
    attempts: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        setStats(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, [pathname]);

  const tabs = [
    { to: "/admin", label: "Overview", icon: BarChart3, end: true },
    { to: "/admin/content", label: "Content", icon: FolderTree },
    { to: "/admin/questions", label: "Questions", icon: HelpCircle },
    { to: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Admin <span className="text-gradient">panel</span>
          </h1>
          <p className="text-muted-foreground">
            Manage content and users.
          </p>
        </div>

        {pathname === "/admin" && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Users" value={stats.users} />
            <StatCard label="Subjects" value={stats.subjects} />
            <StatCard label="Questions" value={stats.questions} />
            <StatCard label="Quiz attempts" value={stats.attempts} />
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = t.end
              ? pathname === t.to
              : pathname.startsWith(t.to) && t.to !== "/admin";

            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${active
                  ? "bg-secondary/20 text-secondary"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </Link>
            );
          })}
        </div>

        <Outlet />
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="arcade-card p-5">
      <div className="text-3xl font-bold text-gradient">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </Card>
  );
}