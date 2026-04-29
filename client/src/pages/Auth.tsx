import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Gamepad2, Loader2 } from "lucide-react";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
  displayName: z.string().trim().min(2, { message: "Name too short" }).max(40),
});

const loginSchema = signupSchema.pick({ email: true, password: true });

export default function Auth() {
  const { user, loading, setUser } = useAuth(); // ✅ added setUser
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/home", { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse({ email, password, displayName });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }

        await axios.post("http://localhost:5000/api/auth/signup", {
          email: parsed.data.email,
          password: parsed.data.password,
          displayName: parsed.data.displayName,
        });

        toast.success("Account created! Please login.");
        setMode("login");

      } else {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }

        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: parsed.data.email,
          password: parsed.data.password,
        });

        // ✅ store token
        localStorage.setItem("token", res.data.token);

        // ✅ FIX: update auth state immediately
        setUser(res.data.user);

        toast.success("Welcome back!");

        navigate("/home"); // instant redirect (no refresh needed)
      }

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="arcade-card w-full max-w-md p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-arcade glow-primary animate-pulse-glow">
            <Gamepad2 className="h-6 w-6 text-primary-foreground" />
          </div>
        </Link>

        <h1 className="mb-1 text-center text-3xl font-bold text-gradient">
          {mode === "login" ? "Welcome back" : "Start your quest"}
        </h1>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          {mode === "login"
            ? "Log in to continue leveling up"
            : "Earn XP, coins, and badges"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="PixelHero"
                maxLength={40}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              maxLength={255}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              maxLength={72}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-arcade font-semibold text-primary-foreground hover:opacity-90"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              "Log in"
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() =>
            setMode(mode === "login" ? "signup" : "login")
          }
          className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-primary"
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have one? Log in"}
        </button>
      </Card>
    </div>
  );
}