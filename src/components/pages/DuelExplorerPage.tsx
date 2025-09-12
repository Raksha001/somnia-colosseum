// pages/DuelExplorerPage.tsx
import React, { useState } from 'react';
import { Search, Filter, Clock, DollarSign, Swords, ShieldOff } from 'lucide-react';
import { DuelCard } from '../components/duel/DuelCard';
import { useDuels } from '../hooks/useDuels'; // Assuming this hook exists

export const DuelExplorerPage: React.FC = () => {
    const { data: duels, isLoading, error } = useDuels();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredDuels = duels?.filter(duel => {
        const matchesSearch = searchQuery === '' ||
            duel.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
            duel.opponent?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || duel.status.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    }) || [];

    if (error) {
        // ... (Error state can be styled better but is functionally fine)
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 space-y-10">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] rounded-full mb-4 shadow-[0_0_20px_var(--accent-purple)]">
                    <Swords className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl font-extrabold text-white" style={{ textShadow: '0 0 15px var(--accent-purple)' }}>
                    Duel Explorer
                </h1>
                <p className="text-xl text-[var(--text-primary)] opacity-70">
                    Find your next challenge on the Bounty Board.
                </p>
            </div>

            {/* Filters */}
            <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-xl border border-[var(--border-color)] rounded-xl p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-primary)] opacity-60" />
                        <input type="text" placeholder="Search by gladiator address..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-black/30 border border-[var(--border-color)] rounded-lg text-white placeholder:opacity-60 focus:border-[var(--primary-cyan)] focus:outline-none transition-colors" />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-primary)] opacity-60" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-auto pl-12 pr-8 py-3 bg-black/30 border border-[var(--border-color)] rounded-lg text-white focus:border-[var(--primary-cyan)] focus:outline-none appearance-none cursor-pointer">
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="active">Active</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-md border border-[var(--border-color)] rounded-xl p-6 text-center"><Clock className="w-8 h-8 text-[var(--accent-magenta)] mx-auto mb-2" /><div className="text-3xl font-bold text-white">{duels?.filter(d => d.status === 'OPEN').length || 0}</div><div className="text-[var(--text-primary)] opacity-70">Open Duels</div></div>
                <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-md border border-[var(--border-color)] rounded-xl p-6 text-center"><DollarSign className="w-8 h-8 text-[var(--primary-cyan)] mx-auto mb-2" /><div className="text-3xl font-bold text-white">{duels?.filter(d => d.status === 'ACTIVE').length || 0}</div><div className="text-[var(--text-primary)] opacity-70">Active Duels</div></div>
                <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-md border border-[var(--border-color)] rounded-xl p-6 text-center"><Search className="w-8 h-8 text-[var(--text-primary)] opacity-70 mx-auto mb-2" /><div className="text-3xl font-bold text-white">{filteredDuels.length}</div><div className="text-[var(--text-primary)] opacity-70">Showing Results</div></div>
            </div>

            {/* Duels Grid */}
            <div>
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-[var(--bg-dark-purple)]/60 border border-[var(--border-color)] rounded-xl p-6 space-y-4 animate-pulse">
                                <div className="h-6 bg-[var(--border-color)] rounded w-3/4"></div>
                                <div className="h-4 bg-[var(--border-color)] rounded w-full"></div>
                                <div className="h-4 bg-[var(--border-color)] rounded w-5/6"></div>
                                <div className="h-12 bg-[var(--border-color)] rounded mt-4"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredDuels.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDuels.map((duel) => (<DuelCard key={duel.id} duel={duel} />))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-[var(--bg-dark-purple)]/40 rounded-xl border border-dashed border-[var(--border-color)]">
                        <ShieldOff className="w-16 h-16 text-[var(--border-color)] mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-white mb-2">No Duels Found</h3>
                        <p className="text-[var(--text-primary)] opacity-70">{searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No bounties posted. Be the first to create a duel!'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};