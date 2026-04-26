import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Coins,
  Flame,
  Gamepad2,
  LogOut,
  Shield,
  Sparkles,
  Trophy,
  User as UserIcon,
} from "lucide-react";

interface ProfileBrief {
  display_name: string;
  xp: number;
  coins: number;
  streak: number;
}

export function AppHeader() {
  const { user, role, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileBrief | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [user]);

  const navItems = [
    { to: "/home", label: "Play", icon: Gamepad2 },
    { to: "/dashboard", label: "Dashboard", icon: Sparkles },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/daily", label: "Daily", icon: Flame },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/home" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-arcade glow-primary">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-gradient">
            QuestXP
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}

          {role === "admin" && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname.startsWith("/admin")
                ? "bg-secondary/10 text-secondary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {profile && (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex items-center gap-1 rounded-full bg-gradient-xp px-3 py-1 text-xs font-bold text-accent-foreground">
                <Sparkles className="h-3.5 w-3.5" /> {profile.xp}
              </div>

              <div className="flex items-center gap-1 rounded-full bg-gradient-coin px-3 py-1 text-xs font-bold text-warning-foreground">
                <Coins className="h-3.5 w-3.5" /> {profile.coins}
              </div>

              <div className="flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                <Flame className="h-3.5 w-3.5" /> {profile.streak}
              </div>
            </div>
          )}

          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <UserIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              signOut();
              navigate("/auth");
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}