import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Zap, Target, DollarSign, Trophy, Star } from 'lucide-react';

export const HomePage: React.FC = () => {
    const { isConnected } = useAccount();

    // Define features for the "Rules of Combat" section
    const features = [
        { icon: Target, title: 'Challenge a Rival', description: 'Create duels with any ERC-20 token and set your stakes.', color: 'var(--primary-cyan)' },
        { icon: Zap, title: 'Master the Markets', description: 'Execute swaps in real-time with our integrated trading interface.', color: 'var(--accent-magenta)' },
        { icon: DollarSign, title: 'Automated Judgment', description: 'Winners are decided impartially and automatically by P&L performance.', color: 'var(--primary-cyan)' },
        { icon: Trophy, title: 'Victor\'s Spoils', description: 'The entire stake is automatically transferred to the victor. Winner takes all.', color: 'var(--accent-magenta)' }
    ];

    // Define data for the "Top Gladiators" leaderboard preview
    const topTraders = [
        { rank: 1, name: '0xCypher', pnl: 245.7, avatar: '🥇' },
        { rank: 2, name: 'Vertex', pnl: 198.2, avatar: '🥈' },
        { rank: 3, name: 'Glitch', pnl: 177.4, avatar: '🥉' }
    ];

    return (
        // The main container for the entire page content.
        // `relative` for positioning background elements, `isolate` for z-indexing.
        <div className="relative isolate overflow-hidden">
            
            {/* --- BACKGROUND AURA EFFECTS (These are for the hero section, layered over the global background) --- */}
            {/* Left side, cyan glow, scaled for impact */}
            <div 
                className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[100vw] h-screen 
                           bg-radial-gradient(circle, var(--primary-cyan), transparent 60%) 
                           opacity-15 blur-3xl pointer-events-none animate-pulse-subtle" 
            />
            {/* Right side, magenta glow, scaled for impact */}
            <div 
                className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[100vw] h-screen 
                           bg-radial-gradient(circle, var(--accent-magenta), transparent 60%) 
                           opacity-15 blur-3xl pointer-events-none animate-pulse-subtle" 
            />

            {/* --- HERO SECTION: The "Face-Off" --- */}
            {/* `z-10` ensures this content is above the background auras */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center p-4">
                <div className="flex flex-col items-center space-y-8">
                    {/* Main Title with split-color text-shadow for a powerful, glowing effect */}
                    <h1 className="text-7xl md:text-9xl font-extrabold tracking-tightest text-white animate-fade-in-up">
                        <span style={{ textShadow: '0 0 20px var(--primary-cyan), 0 0 40px var(--primary-cyan)' }}>Somnia</span>
                        <span style={{ textShadow: '0 0 20px var(--accent-magenta), 0 0 40px var(--accent-magenta)' }}> Colosseum</span>
                    </h1>
                    
                    {/* Thematic Subtitle */}
                    <p 
                        className="text-xl md:text-2xl text-[var(--text-primary)] opacity-80 max-w-2xl mx-auto animate-fade-in-up" 
                        style={{ animationDelay: '0.3s' }}
                    >
                        Challenge Your Rival. Claim the Colosseum.
                    </p>

                    {/* Subtle "VS" overlay, positioned in the background */}
                    {/* <div 
                        className="text-[12rem] md:text-[20rem] font-black text-transparent bg-clip-text bg-gradient-to-t from-transparent to-[var(--border-color)] 
                                   opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1] animate-fade-in-up" 
                        style={{ animationDelay: '0.1s' }}
                    >
                        VS
                    </div> */}

                    {/* Call to Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                        {isConnected ? (
                            <Link 
                                to="/create" 
                                className="px-10 py-5 font-bold rounded-lg transition-all duration-300 flex items-center space-x-3 text-lg
                                           bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] text-white 
                                           shadow-[0_0_25px_var(--accent-purple)] hover:shadow-[0_0_40px_var(--accent-magenta)] hover:scale-105"
                            >
                                <Zap className="w-6 h-6" /> {/* Slightly larger icons */}
                                <span>Challenge Now</span>
                            </Link>
                        ) : (
                            <div className="bg-[var(--bg-dark-purple)] bg-opacity-60 backdrop-blur-sm border border-[var(--border-color)] px-8 py-4 rounded-lg text-lg text-[var(--text-primary)]">
                                Connect Wallet to Enter the Arena
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- PAGE CONTENT SECTIONS --- */}
            {/* This container ensures all subsequent sections are correctly positioned and styled */}
            <div className="relative z-10 px-4 md:px-8 space-y-24 md:space-y-32 pb-24 max-w-7xl mx-auto">

                {/* --- FEATURES SECTION: "The Rules of Combat" --- */}
                <section>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">The Rules of Combat</h2>
                        <p className="text-lg text-[var(--text-primary)] opacity-70 max-w-2xl mx-auto">Four principles govern every duel. Know them, master them.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title} 
                                     className="bg-[var(--bg-dark-purple)] bg-opacity-50 backdrop-blur-md border border-[var(--border-color)] rounded-xl p-6 
                                                transition-all duration-300 group hover:border-[var(--primary-cyan)] hover:shadow-[0_0_25px_-5px_var(--primary-cyan)] hover:-translate-y-2">
                                    <div 
                                        style={{ backgroundColor: feature.color, boxShadow: `0 0 15px ${feature.color}` }} 
                                        className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                                    >
                                        <Icon className="w-7 h-7 text-black" /> {/* Slightly larger icons */}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-[var(--text-primary)] opacity-70">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* --- LEADERBOARD PREVIEW SECTION: "Top Gladiators" --- */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Top Gladiators</h2>
                        <p className="text-lg text-[var(--text-primary)] opacity-70">The reigning champions of the weekly arena.</p>
                    </div>
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {topTraders.map(trader => (
                            <div key={trader.rank} 
                                 className="grid grid-cols-4 items-center gap-4 bg-[var(--bg-dark-purple)] bg-opacity-50 backdrop-blur-md 
                                            border border-[var(--border-color)] p-4 rounded-lg text-lg 
                                            hover:border-[var(--accent-magenta)] transition-colors">
                                <div className="font-bold text-2xl text-center">{trader.avatar} #{trader.rank}</div>
                                <div className="col-span-2 font-semibold text-white">{trader.name}</div>
                                <div className="text-right font-bold text-[var(--semantic-green)]">+{trader.pnl}%</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- STATS SECTION: "Battle Statistics" --- */}
                <section>
                    <div className="max-w-5xl mx-auto py-16 bg-[var(--bg-dark-purple)] bg-opacity-50 backdrop-blur-md rounded-2xl border border-[var(--border-color)]">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="space-y-2">
                                <div className="text-5xl font-bold bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] bg-clip-text text-transparent">1,247</div>
                                <div className="text-[var(--text-primary)] opacity-70">Total Duels</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-5xl font-bold bg-gradient-to-r from-[var(--semantic-green)] to-[var(--primary-cyan)] bg-clip-text text-transparent">$2.4M</div>
                                <div className="text-[var(--text-primary)] opacity-70">Total Volume</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-5xl font-bold bg-gradient-to-r from-[var(--accent-magenta)] to-white bg-clip-text text-transparent">892</div>
                                <div className="text-[var(--text-primary)] opacity-70">Active Gladiators</div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};