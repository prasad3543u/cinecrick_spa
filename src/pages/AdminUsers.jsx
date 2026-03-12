import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Search, ShieldCheck, User, BookOpen, Calendar } from "lucide-react";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.email?.toLowerCase().includes(q) ||
          u.name?.toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await api("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleUpdate(userId, newRole) {
    const label = newRole === "admin" ? "promote to Admin" : "demote to User";
    const confirmed = window.confirm(`Are you sure you want to ${label}?`);
    if (!confirmed) return;

    try {
      setUpdatingId(userId);
      toast.info(`Updating role...`);
      await api(`/admin/users/${userId}/update_role`, {
        method: "PATCH",
        body: { role: newRole },
      });
      toast.success(`User role updated to ${newRole}!`);
      await loadUsers();
    } catch (err) {
      toast.error(err?.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  }

  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalUsers = users.filter((u) => u.role === "user").length;

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-black text-pink-400">Admin Users</h1>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/admin/dashboard")} className="bg-white/10 text-white hover:bg-white/15">
            Dashboard
          </Button>
          <Button onClick={() => navigate("/admin/bookings")} className="bg-white/10 text-white hover:bg-white/15">
            Bookings
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
          <Users className="h-5 w-5 text-pink-400" />
          <div>
            <p className="text-2xl font-black">{users.length}</p>
            <p className="text-xs text-white/50">Total Users</p>
          </div>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-violet-400" />
          <div>
            <p className="text-2xl font-black text-violet-300">{totalAdmins}</p>
            <p className="text-xs text-white/50">Admins</p>
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 flex items-center gap-3">
          <User className="h-5 w-5 text-cyan-400" />
          <div>
            <p className="text-2xl font-black text-cyan-300">{totalUsers}</p>
            <p className="text-xs text-white/50">Regular Users</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-white/40"
        />
      </div>

      {/* Users list */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-white/10 rounded-lg" />
                  <div className="h-4 w-56 bg-white/10 rounded-lg" />
                </div>
                <div className="h-8 w-24 bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/55 p-10 text-center text-white/50">
          No users found.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((user) => (
            <Card key={user.id} className="border-white/10 bg-zinc-950/55 overflow-hidden">
              <div className={`h-0.5 w-full ${
                user.role === "admin"
                  ? "bg-gradient-to-r from-violet-500 to-pink-500"
                  : "bg-gradient-to-r from-white/10 to-white/5"
              }`} />
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* User info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-pink-500/30 to-violet-500/30 border border-white/10 font-black text-lg">
                      {String(user.email || "U")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white truncate">{user.name || "No name"}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                            : "bg-white/10 text-white/60 border border-white/10"
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 truncate">{user.email}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {user.bookings_count} bookings
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {user.interest && (
                          <span className="text-pink-400">
                            {user.interest}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role toggle button */}
                  <div className="shrink-0">
                    {user.role === "admin" ? (
                      <Button
                        onClick={() => handleRoleUpdate(user.id, "user")}
                        disabled={updatingId === user.id}
                        className="bg-white/10 border border-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 text-xs"
                      >
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        {updatingId === user.id ? "Updating..." : "Demote to User"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleRoleUpdate(user.id, "admin")}
                        disabled={updatingId === user.id}
                        className="bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 text-xs"
                      >
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        {updatingId === user.id ? "Updating..." : "Promote to Admin"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}