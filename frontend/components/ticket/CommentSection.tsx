"use client";

import { useRef, useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send, User } from "lucide-react";
import { toast } from "sonner";
import { useComments } from "@/hooks/useComments";

export default function CommentSection({ ticketId }: { ticketId: string }) {
    const { user } = useAuth();
    const { comments, isLoading, mutate } = useComments(ticketId);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isInitialLoad = useRef(true);

    // Scroll to bottom on initial load
    useEffect(() => {
        if (!isLoading && comments.length > 0 && isInitialLoad.current) {
            isInitialLoad.current = false;
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        }
    }, [isLoading, comments.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post(`/tickets/${ticketId}/comments`, {
                content: newComment,
            });
            setNewComment("");
            await mutate(); // Refresh comments
            toast.success("Comment posted");
            // Scroll to bottom after adding
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        } catch (err) {
            console.error("Failed to add comment", err);
            toast.error("Failed to post comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        return date.toLocaleString("en-US", {
            month: isToday ? undefined : "short",
            day: isToday ? undefined : "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <Card className="flex flex-col h-[600px] overflow-hidden border-none shadow-none bg-transparent">
            <div className="flex items-center gap-2 mb-4 px-1">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Comments</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {comments.length}
                </span>
            </div>

            <CardContent className="flex-1 flex flex-col p-0 gap-4 min-h-0">
                {/* Comments List */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-6 pr-4 -mr-4 pl-1 min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
                >
                    {comments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 gap-2">
                            <MessageSquare className="w-8 h-8" />
                            <p className="text-sm">No comments yet</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment._id} className="flex gap-4 group">
                                <Avatar className="w-8 h-8 shrink-0 mt-1 border shadow-sm">
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                                        {comment.author.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 gap-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-foreground">
                                            {comment.author.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTime(comment.createdAt)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-foreground/90 leading-relaxed bg-muted/40 p-3.5 rounded-2xl rounded-tl-sm border border-border/40 shadow-sm">
                                        {comment.content}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Improved Input Area */}
                <div className="mt-4 pt-4 border-t bg-background/50 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="relative flex gap-3 items-end">
                        <Avatar className="w-8 h-8 shrink-0 hidden sm:block">
                            <AvatarFallback className="bg-muted">
                                <User className="w-4 h-4 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="min-h-[44px] max-h-[150px] py-3 pr-12 resize-none bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/10 transition-all rounded-2xl border-transparent focus:border-border shadow-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isSubmitting || !newComment.trim()}
                                className="absolute right-2 bottom-2 h-7 w-7 rounded-full transition-all duration-200"
                                variant={newComment.trim() ? "default" : "ghost"}
                            >
                                <Send className="w-3 h-3" />
                            </Button>
                        </div>
                    </form>
                    <div className="text-[10px] text-muted-foreground text-right mt-1.5 mr-2">
                        Press <span className="font-medium">Enter</span> to post
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
