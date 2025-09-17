import React from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Percent, User, Swords } from 'lucide-react';
import { useDuels } from '../hooks/useDuels'; // Assuming this hook exists

// A helper function to truncate addresses for display
const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const DashboardPage: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { data: allDuels, isLoading } = useDuels();

    if (!isConnected) {
        return (
            <div className="text-center py-24 min-h-[60vh] flex flex-col items-center justify-center">
                <User className="w-16 h-16 text-[var(--border-color)] mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Connect Your Wallet</h2>
                <p className="text-lg text-[var(--text-primary)] opacity-70">Please connect your wallet to view your Gladiator Dashboard.</p>
            </div>
        );
    }

    // Filter for duels where the current user is either the creator or opponent
    const myDuels = allDuels?.filter(duel =>
        (duel.creator && duel.creator.toLowerCase() === address?.toLowerCase()) ||
        (duel.opponent && duel.opponent.toLowerCase() === address?.toLowerCase())
    ) || [];

    const resolvedDuels = myDuels.filter(d => d.status === 'RESOLVED');
    const stats = {
        total: myDuels.length,
        won: resolvedDuels.filter(d => d.winner?.toLowerCase() === address?.toLowerCase()).length,
        active: myDuels.filter(d => d.status === 'ACTIVE').length,
        winRate: resolvedDuels.length > 0 ? (resolvedDuels.filter(d => d.winner?.toLowerCase() === address?.toLowerCase()).length / resolvedDuels.length * 100) : 0
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 space-y-10">
            {/* THEME: Personalized Header */}
            <div className="text-center md:text-left">
                <h1 className="text-5xl font-extrabold text-white">Your Dashboard</h1>
                <p className="text-xl text-[var(--text-primary)] opacity-70 mt-2">
                    Welcome back, Gladiator <span className="text-[var(--primary-cyan)] font-semibold">{truncateAddress(address || '')}</span>
                </p>
            </div>

            {/* THEME: Impactful Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-md border border-[var(--border-color)] rounded-xl p-6">
                    <div className="flex items-center justify-between"><div className="text-[var(--text-primary)] opacity-70">Total Duels</div><Swords className="w-6 h-6 text-[var(--text-primary)] opacity-50" /></div>
                    <div className="text-4xl font-bold text-white mt-2">{stats.total}</div>
                </div>
                <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-md border border-[var(--border-color)] rounded-xl p-6">
                    <div className="flex items-center justify-between"><div className="text-[var(--text-primary)] opacity-70">Duels Won</div><Trophy className="w-6 h-6 text-[var(--semantic-green)]" /></div>
                    <div className="text-4xl font-bold text-white mt-2">{stats.won}</div>
                </div>
                <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-md border border-[var(--border-color)] rounded-xl p-6">
                    <div className="flex items-center justify-between"><div className="text-[var(--text-primary)] opacity-70">Active Duels</div><Clock className="w-6 h-6 text-[var(--primary-cyan)]" /></div>
                    <div className="text-4xl font-bold text-white mt-2">{stats.active}</div>
                </div>
                <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-md border border-[var(--border-color)] rounded-xl p-6">
                    <div className="flex items-center justify-between"><div className="text-[var(--text-primary)] opacity-70">Win Rate</div><Percent className="w-6 h-6 text-[var(--accent-magenta)]" /></div>
                    <div className="text-4xl font-bold text-white mt-2">{stats.winRate.toFixed(1)}%</div>
                </div>
            </div>

            {/* THEME: "Battle History" Table */}
            <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-md border border-[var(--border-color)] rounded-2xl">
                <h2 className="text-2xl font-bold text-white p-6 border-b border-[var(--border-color)]">
                    Battle History
                </h2>
                
                {isLoading ? (
                    <div className="p-6 text-center text-[var(--text-primary)] opacity-70">Loading your history...</div>
                ) : myDuels.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-[var(--border-color)] text-sm text-[var(--text-primary)] opacity-70">
                                <tr>
                                    <th className="p-4 font-semibold">Duel ID</th>
                                    <th className="p-4 font-semibold">Opponent</th>
                                    <th className="p-4 font-semibold">Prize Pool</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Outcome</th>
                                    <th className="p-4 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myDuels.slice(0, 10).map((duel) => {
                                    const opponent = duel.creator.toLowerCase() === address?.toLowerCase() ? duel.opponent : duel.creator;
                                    const isWinner = duel.winner?.toLowerCase() === address?.toLowerCase();
                                    return (
                                        <tr key={duel.id} className="border-b border-[var(--border-color)]/50 hover:bg-black/20 transition-colors">
                                            <td className="p-4 font-semibold text-white">
                                                <Link to={`/duel/${duel.id}`} className="hover:text-[var(--primary-cyan)]">#{duel.id}</Link>
                                            </td>
                                            <td className="p-4 text-[var(--text-primary)]">{opponent ? truncateAddress(opponent) : 'N/A'}</td>
                                            <td className="p-4 text-white font-semibold">{parseFloat(duel.wagerAmount) * 2} {duel.tokenSymbol}</td>
                                            <td className="p-4"><span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                duel.status === 'ACTIVE' ? 'bg-[var(--primary-cyan)]/10 text-[var(--primary-cyan)]' :
                                                duel.status === 'OPEN' ? 'bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)]' :
                                                'bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]'
                                            }`}>{duel.status}</span></td>
                                            <td className={`p-4 font-bold ${
                                                duel.status !== 'RESOLVED' ? 'text-[var(--text-primary)] opacity-50' :
                                                isWinner ? 'text-[var(--semantic-green)]' : 'text-[var(--semantic-red)]'
                                            }`}>
                                                {duel.status === 'RESOLVED' ? (isWinner ? 'Victory' : 'Defeat') : 'Pending'}
                                            </td>
                                            <td className="p-4 text-[var(--text-primary)] opacity-70">{new Date(duel.startTime * 1000).toLocaleDateString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Swords className="w-12 h-12 text-[var(--border-color)] mx-auto mb-4" />
                        <p className="text-[var(--text-primary)] opacity-70">No battle history found.</p>
                        <Link to="/create" className="mt-4 inline-block text-[var(--primary-cyan)] font-semibold hover:underline">
                            Create your first duel!
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};