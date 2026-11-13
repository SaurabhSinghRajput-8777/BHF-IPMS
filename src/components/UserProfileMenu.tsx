"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  KeyRound,
  LogOut,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function UserProfileMenu() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setSubmittingPassword(true);
    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        setPasswordSuccess("Password successfully changed!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordSuccess("");
        }, 1500);
      } else {
        setPasswordError(json.error?.message || "Failed to update password.");
      }
    } catch {
      setPasswordError("Network error occurred. Please try again.");
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-white/40" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="h-10 px-3 border border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-[family-name:var(--font-aldrich)] cursor-pointer flex items-center space-x-2 transition-all shadow-sm outline-none"
        >
          <div className="h-6 w-6 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center font-bold text-[11px]">
            {initials}
          </div>
          <span className="hidden sm:inline-block max-w-[120px] truncate">{user.name}</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-72 p-2 bg-slate-900/95 backdrop-blur-2xl border border-white/15 text-slate-100 rounded-2xl shadow-2xl shadow-black/90 space-y-1 z-50"
        >
          {/* User Details Header */}
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white text-sm tracking-wide font-[family-name:var(--font-aldrich)] truncate">
                {user.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-sky-400/30 bg-sky-400/10 text-sky-300 font-mono uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-white/50 truncate font-mono">{user.email}</p>
          </div>

          <DropdownMenuSeparator className="bg-white/10 my-1" />

          {/* Change Password Action */}
          <DropdownMenuItem
            onClick={() => {
              setPasswordError("");
              setPasswordSuccess("");
              setIsPasswordModalOpen(true);
            }}
            className="p-2.5 rounded-xl hover:bg-white/10 text-white cursor-pointer flex items-center space-x-2.5 text-xs font-[family-name:var(--font-aldrich)] transition-colors"
          >
            <KeyRound className="h-4 w-4 text-sky-400" />
            <span>Change Password</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/10 my-1" />

          {/* Logout Action */}
          <DropdownMenuItem
            onClick={handleLogout}
            className="p-2.5 rounded-xl hover:bg-rose-500/15 text-rose-300 hover:text-rose-200 cursor-pointer flex items-center space-x-2.5 text-xs font-[family-name:var(--font-aldrich)] transition-colors"
          >
            <LogOut className="h-4 w-4 text-rose-400" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md bg-slate-900/95 backdrop-blur-2xl border border-white/15 text-slate-100 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/90">
          <DialogHeader className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-sky-400/20 bg-sky-400/10 text-sky-300 text-xs font-[family-name:var(--font-aldrich)] w-fit">
              <Shield className="h-3.5 w-3.5" />
              <span>SECURITY CREDENTIALS</span>
            </div>
            <DialogTitle className="text-lg font-bold text-white tracking-wide font-[family-name:var(--font-aldrich)]">
              Update Account Password
            </DialogTitle>
            <DialogDescription className="text-xs text-white/50">
              Enter your current password followed by your new password (minimum 8 characters).
            </DialogDescription>
          </DialogHeader>

          {passwordError && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center space-x-2 text-red-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/70 font-[family-name:var(--font-aldrich)]">
                Current Password
              </Label>
              <Input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/70 font-[family-name:var(--font-aldrich)]">
                New Password
              </Label>
              <Input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/70 font-[family-name:var(--font-aldrich)]">
                Confirm New Password
              </Label>
              <Input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl text-sm"
              />
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                className="h-10 border-white/20 text-white hover:bg-white/10 rounded-xl text-xs font-[family-name:var(--font-aldrich)] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingPassword}
                className="h-10 bg-white text-slate-950 hover:bg-white/90 text-xs font-semibold rounded-xl font-[family-name:var(--font-aldrich)] cursor-pointer shadow-md shadow-white/10 disabled:opacity-50"
              >
                {submittingPassword ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
