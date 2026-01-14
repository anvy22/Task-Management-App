"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Ticket } from "@/types/ticket";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    UserCircle,
    AlertCircle,
    Trash2,
    Activity,
    CheckCircle,
} from "lucide-react";
import CommentSection from "@/components/ticket/CommentSection";

type ActivityItem = {
    _id: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    performedBy: {
        _id: string;
        name: string;
    };
    timestamp: string;
};

const statusConfig = {
    todo: { label: "To Do", color: "bg-slate-500" },
    in_progress: { label: "In Progress", color: "bg-orange-500" },
    done: { label: "Done", color: "bg-green-500" },
};

const priorityConfig = {
    low: { label: "Low", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    medium: { label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    high: { label: "High", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

// Format activity action to human-readable text
const formatActivityAction = (activity: ActivityItem) => {
    switch (activity.action) {
        case "TICKET_CREATED":
            return "created this ticket";
        case "STATUS_UPDATED":
            const oldStatus = statusConfig[activity.oldValue as keyof typeof statusConfig]?.label || activity.oldValue;
            const newStatus = statusConfig[activity.newValue as keyof typeof statusConfig]?.label || activity.newValue;
            return `changed status from "${oldStatus}" to "${newStatus}"`;
        case "TICKET_REVIEWED":
            return "approved this ticket as complete";
        case "TICKET_DELETED":
            return "deleted this ticket";
        case "PRIORITY_UPDATED":
            return `changed priority from "${activity.oldValue}" to "${activity.newValue}"`;
        case "ASSIGNEE_UPDATED":
            return `reassigned the ticket`;
        default:
            return activity.action.toLowerCase().replace(/_/g, " ");
    }
};

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, ready } = useAuth();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [reviewing, setReviewing] = useState(false);

    useEffect(() => {
        if (!ready || !user) return;

        const fetchData = async () => {
            try {
                // Fetch ticket and activities in parallel
                const [ticketRes, activityRes] = await Promise.all([
                    api.get(`/tickets/${params.id}`),
                    api.get(`/tickets/${params.id}/activity`),
                ]);
                setTicket(ticketRes.data);
                setActivities(activityRes.data);
            } catch (err: any) {
                console.error("Failed to fetch ticket", err);
                setError(err.response?.data?.message || "Failed to load ticket");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [ready, user, params.id]);

    const handleDelete = async () => {
        if (!ticket) return;

        setDeleting(true);
        try {
            await api.delete(`/tickets/${ticket._id}`);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Failed to delete ticket", err);
            setError(err.response?.data?.message || "Failed to delete ticket");
            setDeleting(false);
        }
    };

    const handleReview = async () => {
        if (!ticket) return;

        setReviewing(true);
        try {
            const res = await api.patch(`/tickets/${ticket._id}/review`);
            setTicket(res.data);
            // Refetch activities
            const activityRes = await api.get(`/tickets/${ticket._id}/activity`);
            setActivities(activityRes.data);
        } catch (err: any) {
            console.error("Failed to review ticket", err);
            setError(err.response?.data?.message || "Failed to review ticket");
        } finally {
            setReviewing(false);
        }
    };

    if (!ready || loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-muted-foreground">Loading ticket...</span>
                </div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <AlertCircle className="w-12 h-12 text-destructive" />
                            <div>
                                <h3 className="font-semibold text-lg">Ticket Not Found</h3>
                                <p className="text-muted-foreground mt-1">
                                    {error || "The ticket you're looking for doesn't exist."}
                                </p>
                            </div>
                            <Button asChild variant="outline">
                                <Link href="/dashboard">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const status = statusConfig[ticket.status];
    const priority = priorityConfig[ticket.priority];

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateString);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header with back button and actions */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold truncate">{ticket.title}</h1>
                    <p className="text-muted-foreground text-sm">Ticket ID: {ticket._id}</p>
                </div>

                {/* Admin-only review button for pending review tickets */}
                {user?.role === "admin" && ticket.status === "done" && !ticket.isReviewed && (
                    <Button
                        onClick={handleReview}
                        disabled={reviewing}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {reviewing ? "Reviewing..." : "Approve"}
                    </Button>
                )}

                {/* Admin-only delete button */}
                {user?.role === "admin" && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={deleting}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete "{ticket.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Main content grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Left column - Main details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Description Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ticket.description ? (
                                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                    {ticket.description}
                                </p>
                            ) : (
                                <p className="text-muted-foreground italic">
                                    No description provided
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Comment Section */}
                    <CommentSection ticketId={ticket._id} />

                    {/* Activity Log Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Activity Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activities.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {activities.map((activity) => (
                                        <div
                                            key={activity._id}
                                            className="flex gap-3 text-sm border-l-2 border-muted pl-4 pb-4 last:pb-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p>
                                                    <span className="font-medium">{activity.performedBy.name}</span>
                                                    {" "}
                                                    <span className="text-muted-foreground">
                                                        {formatActivityAction(activity)}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatRelativeTime(activity.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right column - Meta info */}
                <div className="space-y-6">
                    {/* Status & Priority */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Status */}
                            <div>
                                <span className="text-sm text-muted-foreground block mb-2">
                                    Status
                                </span>
                                <Badge
                                    className={`${status.color} text-white px-3 py-1`}
                                >
                                    {status.label}
                                </Badge>
                            </div>

                            {/* Priority */}
                            <div>
                                <span className="text-sm text-muted-foreground block mb-2">
                                    Priority
                                </span>
                                <Badge
                                    variant="outline"
                                    className={`${priority.color} px-3 py-1`}
                                >
                                    {priority.label}
                                </Badge>
                            </div>

                            {/* Deadline */}
                            {ticket.deadline && (
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-2">
                                        Deadline
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            {formatDate(ticket.deadline)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Created */}
                            {ticket.createdAt && (
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-2">
                                        Created
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {formatDateTime(ticket.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* People */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">People</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Assigned To */}
                            <div>
                                <span className="text-sm text-muted-foreground block mb-2">
                                    Assigned To
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{ticket.assignedTo.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {ticket.assignedTo.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Created By */}
                            {ticket.createdBy && (
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-2">
                                        Created By
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                            <UserCircle className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{ticket.createdBy.name}</p>
                                            {ticket.createdBy.email && (
                                                <p className="text-xs text-muted-foreground">
                                                    {ticket.createdBy.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
