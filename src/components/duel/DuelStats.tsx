import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

// Your existing data fetching logic is preserved.
// This simple axios-like wrapper is from your original file.
const axios = {
    get: async (url: string, config?: any) => {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', ...config?.headers },
            ...config
        });
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        return { data, status: response.status, statusText: response.statusText };
    }
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface DuelStatsProps {
  duel: any; // It's best to replace 'any' with your actual duel type
}

export const DuelStats: React.FC<DuelStatsProps> = ({ duel }) => {
    // --- All of your existing state and useEffect data fetching logic is preserved ---
    const [liveStats, setLiveStats] = useState({ creator: { pnlPercent: 0, currentValue: 0 }, opponent: { pnlPercent: 0, currentValue: 0 } });
    const [chartData, setChartData] = useState<any[]>([]);
    const [initialValues, setInitialValues] = useState<{ creator: number | null, opponent: number | null }>({ creator: null, opponent: null });
    
    useEffect(() => {
        let isMounted = true;
        let currentRequestId = 0;
        const activeRequests = new Set();
        setInitialValues({ creator: null, opponent: null });
        setChartData([]);
        const fetchPortfolioValue = async (address: string, requestId: number) => {
            if (activeRequests.has(address)) return 0;
            activeRequests.add(address);
            try {
                const response = await axios.get(`${API_BASE_URL}/portfolio/${address}`, { timeout: 10000 });
                if (!isMounted || requestId !== currentRequestId) return 0;
                let portfolioValue = 0;
                if (response.data.success && response.data.data) {
                    if (response.data.data.totalValue !== undefined) {
                        portfolioValue = Number(response.data.data.totalValue);
                    }
                }
                return portfolioValue;
            } catch (error) {
                return 0;
            } finally {
                activeRequests.delete(address);
            }
        };
        const fetchLiveStats = async () => {
            if (!isMounted) return;
            currentRequestId++;
            const thisRequestId = currentRequestId;
            try {
                activeRequests.clear();
                let creatorAmount = duel.creator ? await fetchPortfolioValue(duel.creator, thisRequestId) : 0;
                if (!isMounted || thisRequestId !== currentRequestId) return;
                let opponentAmount = 0;
                if (duel.opponent && !duel.opponent.startsWith("0x0000000000")) {
                    opponentAmount = await fetchPortfolioValue(duel.opponent, thisRequestId);
                }
                if (!isMounted || thisRequestId !== currentRequestId) return;
                const calculatePnL = (currentValue: number, initialValue: number | null) => {
                    if (initialValue === null || initialValue === 0) return 0;
                    return ((currentValue - initialValue) / initialValue) * 100;
                };
                let currentInitialValues = initialValues;
                if (currentInitialValues.creator === null && creatorAmount > 0) {
                    currentInitialValues = { ...currentInitialValues, creator: creatorAmount };
                    setInitialValues(currentInitialValues);
                }
                if (currentInitialValues.opponent === null && opponentAmount > 0 && duel.opponent) {
                    currentInitialValues = { ...currentInitialValues, opponent: opponentAmount };
                    setInitialValues(currentInitialValues);
                }
                const creatorPnL = calculatePnL(creatorAmount, currentInitialValues.creator);
                const opponentPnL = calculatePnL(opponentAmount, currentInitialValues.opponent);
                setLiveStats({ creator: { currentValue: creatorAmount, pnlPercent: creatorPnL }, opponent: { currentValue: opponentAmount, pnlPercent: opponentPnL } });
                const now = new Date();
                const timestamp = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const newDataPoint = { time: timestamp, creator: creatorAmount, opponent: opponentAmount, timestamp: now.getTime() };
                setChartData(prevData => [...prevData.slice(-19), newDataPoint]);
            } catch (error) { console.error('Error in fetchLiveStats:', error); }
        };
        const timeoutId = setTimeout(() => { if (isMounted) fetchLiveStats(); }, 100);
        const interval = setInterval(() => { if (isMounted) fetchLiveStats(); }, 60000);
        return () => { isMounted = false; currentRequestId++; activeRequests.clear(); clearTimeout(timeoutId); clearInterval(interval); };
    }, [duel.creator, duel.opponent]);
    
    const timeRemaining = duel.endTime ? Math.max(0, duel.endTime - Math.floor(Date.now() / 1000)) : 0;
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const truncateAddress = (address: string) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

    return (
        <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-6">
            <h2 className="text-3xl font-bold text-white mb-6">Live Battle Stats</h2>

            {duel.status === 'ACTIVE' && (
                <div className="bg-black/30 rounded-lg p-4 mb-6 text-center border border-[var(--border-color)]">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                        <Clock className="w-5 h-5 text-[var(--accent-magenta)] animate-pulse" />
                        <span className="text-[var(--text-primary)] opacity-70">Time Remaining</span>
                    </div>
                    <div className="text-4xl font-bold text-white font-mono tracking-wider">
                        {formatTime(timeRemaining)}
                    </div>
                </div>
            )}

            <div className="bg-black/30 rounded-lg p-4 pt-8 mb-6 relative">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="time" stroke="var(--text-primary)" opacity={0.7} tick={{ fontSize: 12, fill: 'var(--text-primary)' }} />
                            <YAxis stroke="var(--text-primary)" opacity={0.7} tick={{ fontSize: 12, fill: 'var(--text-primary)' }} domain={['dataMin - 100', 'dataMax + 100']} />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'rgba(16, 6, 30, 0.8)',
                                    border: '1px solid var(--border-color)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '8px',
                                }}
                                labelStyle={{ color: 'white', fontWeight: 'bold' }}
                                itemStyle={{ fontWeight: 'semibold' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line type="monotone" dataKey="creator" name="Creator" stroke="var(--primary-cyan)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: 'var(--primary-cyan)', stroke: 'var(--bg-dark-purple)', strokeWidth: 2 }} />
                            <Line type="monotone" dataKey="opponent" name="Opponent" stroke="var(--accent-magenta)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: 'var(--accent-magenta)', stroke: 'var(--bg-dark-purple)', strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[250px] flex items-center justify-center text-[var(--text-primary)] opacity-60">
                        <div className="text-center">
                            <Activity className="w-8 h-8 mx-auto mb-2" />
                            <div>Awaiting first data point...</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Creator Card */}
                <div className="bg-black/20 border border-[var(--primary-cyan)]/30 rounded-lg p-4 space-y-2 relative overflow-hidden">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-radial-gradient(circle, var(--primary-cyan), transparent 60%) opacity-10"></div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[var(--primary-cyan)]">Creator</h3>
                        <div className="text-xs opacity-60">{truncateAddress(duel.creator)}</div>
                    </div>
                    <div className="flex justify-between text-sm"><span className="opacity-70">Current Value:</span><span className="font-medium text-white">${Number(liveStats.creator.currentValue || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm">
                        <span className="opacity-70">P&L:</span>
                        <div className={`flex items-center space-x-1 font-bold text-lg ${liveStats.creator.pnlPercent >= 0 ? 'text-[var(--semantic-green)]' : 'text-[var(--semantic-red)]'}`}>
                            {liveStats.creator.pnlPercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span>{liveStats.creator.pnlPercent.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
                {/* Opponent Card */}
                <div className="bg-black/20 border border-[var(--accent-magenta)]/30 rounded-lg p-4 space-y-2 relative overflow-hidden">
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-radial-gradient(circle, var(--accent-magenta), transparent 60%) opacity-10"></div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[var(--accent-magenta)]">Opponent</h3>
                        <div className="text-xs opacity-60">{!duel.opponent || duel.opponent.startsWith('0x000') ? 'Waiting...' : truncateAddress(duel.opponent)}</div>
                    </div>
                    {!duel.opponent || duel.opponent.startsWith('0x000') ? (
                        <div className="text-center py-6 opacity-60">Waiting for opponent...</div>
                    ) : (
                        <>
                            <div className="flex justify-between text-sm"><span className="opacity-70">Current Value:</span><span className="font-medium text-white">${Number(liveStats.opponent.currentValue || 0).toLocaleString()}</span></div>
                            <div className="flex justify-between text-sm">
                                <span className="opacity-70">P&L:</span>
                                <div className={`flex items-center space-x-1 font-bold text-lg ${liveStats.opponent.pnlPercent >= 0 ? 'text-[var(--semantic-green)]' : 'text-[var(--semantic-red)]'}`}>
                                    {liveStats.opponent.pnlPercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    <span>{liveStats.opponent.pnlPercent.toFixed(2)}%</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};