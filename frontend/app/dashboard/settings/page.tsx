"use client";

import api from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  UserCog,
  Mail,
  ShieldCheck,
  Calendar,
  Pencil,
  Check,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UserDetailsPage() {
  const [details, setDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const result = await api.get("/users/details");
      setDetails(result.data);
      setName(result.data.name);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateName() {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    const previousName = details?.name;

    // Optimistic UI update
    setDetails((prev) =>
      prev ? { ...prev, name } : prev
    );

    try {
      await api.patch("/users/update", { name });
      toast.success("Name updated");
      setEditing(false);
    } catch {
      // Rollback
      setDetails((prev) =>
        prev && previousName
          ? { ...prev, name: previousName }
          : prev
      );
      setName(previousName || "");
      toast.error("Failed to update name");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader>
          {loading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserCog className="h-5 w-5 text-muted-foreground" />

              {editing ? (
                <div className="flex items-center gap-2 w-full">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    onClick={handleUpdateName}
                    disabled={saving}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setName(details!.name);
                      setEditing(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span>{details?.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </>
              )}
            </CardTitle>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </>
          ) : (
            <>
              {/* Email */}
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email</span>
                <span className="ml-auto font-medium">
                  {details?.email}
                </span>
              </div>

              <Separator />

              {/* Role */}
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Role</span>
                <Badge variant="secondary" className="ml-auto capitalize">
                  {details?.role}
                </Badge>
              </div>

              <Separator />

              {/* Status */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className="ml-auto"
                  variant={details?.isActive ? "default" : "destructive"}
                >
                  {details?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <Separator />

              {/* Created At */}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined</span>
                <span className="ml-auto">
                  {new Date(details!.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
