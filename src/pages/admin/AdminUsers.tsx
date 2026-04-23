import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Ban, ShieldCheck } from "lucide-react";

interface UserRow {
  id: string;
  display_name: string;
  xp: number;
  coins: number;
  streak: number;
  banned: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").order("xp", { ascending: false });
    setUsers((data ?? []) as UserRow[]);
  };
  useEffect(() => { load(); }, []);

  const toggleBan = async (id: string, banned: boolean) => {
    const { error } = await supabase.rpc("set_user_banned", { _target: id, _banned: !banned });
    if (error) return toast.error(error.message);
    toast.success(!banned ? "User banned" : "User unbanned");
    load();
  };

  const filtered = users.filter((u) => u.display_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="arcade-card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold">Users ({users.length})</h3>
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-left text-muted-foreground">
              <th className="py-2">Name</th>
              <th className="py-2">XP</th>
              <th className="py-2">Coins</th>
              <th className="py-2">Streak</th>
              <th className="py-2">Status</th>
              <th className="py-2">Joined</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border/30">
                <td className="py-3 font-medium">{u.display_name}</td>
                <td className="py-3 text-accent">{u.xp}</td>
                <td className="py-3 text-warning">{u.coins}</td>
                <td className="py-3 text-destructive">🔥 {u.streak}</td>
                <td className="py-3">{u.banned ? <Badge variant="destructive">Banned</Badge> : <Badge variant="outline" className="border-accent/50 text-accent">Active</Badge>}</td>
                <td className="py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="py-3 text-right">
                  <Button size="sm" variant={u.banned ? "outline" : "destructive"} onClick={() => toggleBan(u.id, u.banned)}>
                    {u.banned ? <><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Unban</> : <><Ban className="mr-1 h-3.5 w-3.5" /> Ban</>}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-6 text-center text-muted-foreground">No users.</p>}
      </div>
    </Card>
  );
}
