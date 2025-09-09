import React from 'react';
import { Clock, Flag, Trophy, UserPlus } from 'lucide-react';

interface DuelTimelineProps {
  duel: any; // Replace 'any' with your actual duel type
}

// A helper function to truncate addresses for display
const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const DuelTimeline: React.FC<DuelTimelineProps> = ({ duel }) => {

    // THEME: A cleaner way to generate events and map them to our theme
    const getTimelineEvents = (duelData: any) => {
        const events = [];

        // Event: Duel Created
        events.push({
            id: 1,
            title: 'Duel Created',
            description: `By ${truncateAddress(duelData.creator)}`,
            timestamp: new Date(duelData.startTime * 1000),
            Icon: Flag,
            color: 'text-[var(--primary-cyan)]'
        });

        // Event: Opponent Joined
        const isOpponentJoined = duelData.opponent && !duelData.opponent.startsWith('0x000');
        if (isOpponentJoined) {
            events.push({
                id: 2,
                title: 'Opponent Joined',
                description: `Rival ${truncateAddress(duelData.opponent)} accepted`,
                // Note: You would likely get this timestamp from your contract events
                timestamp: new Date(duelData.startTime * 1000 + 10000), // Placeholder timestamp
                Icon: UserPlus,
                color: 'text-[var(--accent-magenta)]'
            });
        }

        // Event: Duel Resolved
        if (duelData.status === 'RESOLVED' && duelData.winner) {
            events.push({
                id: 3,
                title: 'Duel Resolved',
                description: `Winner: ${truncateAddress(duelData.winner)}`,
                timestamp: new Date(duelData.endTime * 1000),
                Icon: Trophy,
                color: 'text-[var(--semantic-green)]'
            });
        }

        return events;
    };

    const timelineEvents = getTimelineEvents(duel);

    return (
        // THEME: Main container with frosted glass and sticky positioning
        <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-6 h-fit sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-[var(--border-color)] pb-4">
                Duel Timeline
            </h3>
            
            {/* THEME: A robust, CSS-based timeline structure */}
            <ol className="relative border-l-2 border-[var(--border-color)]/50 ml-4">                  
                {timelineEvents.map((event) => {
                    const { Icon, color } = event;
                    return (
                        <li key={event.id} className="mb-8 ml-8">            
                            <span className={`absolute flex items-center justify-center w-8 h-8 bg-[var(--bg-dark-purple)] rounded-full -left-[17px] border-2 border-[var(--border-color)]`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                            </span>
                            <h4 className="flex items-center mb-1 text-md font-semibold text-white">
                                {event.title}
                            </h4>
                            <time className="block mb-2 text-xs font-normal leading-none text-[var(--text-primary)] opacity-50">
                                {event.timestamp.toLocaleString()}
                            </time>
                            <p className="text-sm font-normal text-[var(--text-primary)] opacity-70">
                                {event.description}
                            </p>
                        </li>
                    )
                })}

                {duel.status === 'ACTIVE' && (
                    <li className="ml-8">            
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-[var(--bg-dark-purple)] rounded-full -left-[17px] border-2 border-[var(--border-color)]">
                            <Clock className="w-4 h-4 text-[var(--text-primary)] opacity-50 animate-pulse" />
                        </span>
                        <h4 className="flex items-center mb-1 text-md font-semibold text-white opacity-50">
                            Battle In Progress...
                        </h4>
                        <p className="text-sm font-normal text-[var(--text-primary)] opacity-50">
                            Awaiting duel resolution.
                        </p>
                    </li>
                )}
            </ol>
        </div>
    );
};