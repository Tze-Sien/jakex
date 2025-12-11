"use client";

import { getSession, getUser, signOut } from "@repo/auth";
import { useEffect, useState } from "react";

interface User {
    id: string;
    email?: string;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
        name?: string;
        picture?: string;
    };
}

interface AuthStatusProps {
    onAuthChange?: (user: User | null) => void;
}

export function AuthStatus({ onAuthChange }: AuthStatusProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const { session } = await getSession();
                const currentUser = session?.user as User | null;
                setUser(currentUser ?? null);
                onAuthChange?.(currentUser ?? null);
            } catch (error) {
                console.error("Error checking auth:", error);
                setUser(null);
                onAuthChange?.(null);
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, [onAuthChange]);

    const handleSignOut = async () => {
        try {
            await signOut();
            setUser(null);
            onAuthChange?.(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Loading...</span>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const userName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email ||
        "User";
    const avatarUrl =
        user.user_metadata?.avatar_url || user.user_metadata?.picture;

    return (
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={userName}
                        className="h-10 w-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{userName}</span>
                    {user.email && (
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    )}
                </div>
            </div>
            <button
                onClick={handleSignOut}
                className="ml-auto rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                type="button"
            >
                Sign Out
            </button>
        </div>
    );
}
