"use client";

import { Trophy, Medal, Crown, TrendingUp, Users } from "lucide-react";

interface LeaguePlayer {
    id: string;
    name: string;
    xp: number;
    avatar?: string;
    isCurrentUser?: boolean;
}

interface LeagueBadgeProps {
    league: "bronze" | "silver" | "gold" | "diamond" | "master";
    rank: number;
    totalPlayers: number;
    topPlayers?: LeaguePlayer[];
    currentUserXP?: number;
}

const LEAGUE_CONFIG = {
    bronze: {
        name: "Bronze",
        color: "from-amber-600 to-amber-800",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        textColor: "text-amber-600 dark:text-amber-400",
        icon: Medal,
    },
    silver: {
        name: "Silver",
        color: "from-gray-400 to-gray-600",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500/30",
        textColor: "text-gray-600 dark:text-gray-400",
        icon: Medal,
    },
    gold: {
        name: "Gold",
        color: "from-yellow-400 to-yellow-600",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
        textColor: "text-yellow-600 dark:text-yellow-400",
        icon: Trophy,
    },
    diamond: {
        name: "Diamond",
        color: "from-cyan-400 to-blue-600",
        bgColor: "bg-cyan-500/10",
        borderColor: "border-cyan-500/30",
        textColor: "text-cyan-600 dark:text-cyan-400",
        icon: Crown,
    },
    master: {
        name: "Master",
        color: "from-purple-400 to-pink-600",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
        textColor: "text-purple-600 dark:text-purple-400",
        icon: Crown,
    },
};

export function LeagueBadge({
    league,
    rank,
    totalPlayers,
    topPlayers = [],
    currentUserXP = 0,
}: LeagueBadgeProps) {
    const config = LEAGUE_CONFIG[league];
    const Icon = config.icon;
    const isTopThree = rank <= 3;

    return (
        <div className={`rounded-2xl ${config.bgColor} border ${config.borderColor} p-4 relative overflow-hidden`}>
            {/* Background glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.color} opacity-10 rounded-full blur-2xl`} />

            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className={`font-bold ${config.textColor}`}>{config.name} League</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="w-3 h-3" />
                                <span>{totalPlayers} players</span>
                            </div>
                        </div>
                    </div>

                    {/* Rank badge */}
                    <div className={`
            px-3 py-1.5 rounded-xl font-bold text-sm
            ${isTopThree
                            ? `bg-gradient-to-r ${config.color} text-white`
                            : `${config.bgColor} ${config.textColor}`
                        }
          `}>
                        #{rank}
                    </div>
                </div>

                {/* Leaderboard preview */}
                {topPlayers.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {topPlayers.slice(0, 3).map((player, index) => (
                            <div
                                key={player.id}
                                className={`
                  flex items-center gap-3 p-2 rounded-xl transition-colors
                  ${player.isCurrentUser ? `${config.bgColor} border ${config.borderColor}` : "hover:bg-background/50"}
                `}
                            >
                                {/* Rank */}
                                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${index === 0 ? "bg-yellow-500 text-white" : ""}
                  ${index === 1 ? "bg-gray-400 text-white" : ""}
                  ${index === 2 ? "bg-amber-600 text-white" : ""}
                `}>
                                    {index + 1}
                                </div>

                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-white text-sm font-bold">
                                    {player.name[0]}
                                </div>

                                {/* Name */}
                                <span className={`flex-1 text-sm font-medium ${player.isCurrentUser ? config.textColor : "text-foreground"}`}>
                                    {player.name}
                                    {player.isCurrentUser && " (You)"}
                                </span>

                                {/* XP */}
                                <span className="text-sm text-muted-foreground">{player.xp} XP</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Promotion zone indicator */}
                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${isTopThree ? "text-green-500" : "text-muted-foreground"}`} />
                        <span className="text-xs text-muted-foreground">
                            {isTopThree ? "Promotion zone! 🚀" : `${4 - rank} spots to promotion`}
                        </span>
                    </div>

                    <span className="text-xs font-bold text-muted-foreground">
                        Your XP: {currentUserXP}
                    </span>
                </div>
            </div>
        </div>
    );
}
