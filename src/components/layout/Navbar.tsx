import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Sword, Plus, Search, BarChart3 } from 'lucide-react';
import SomniaIcon from '../../assets/somnia_crucible.png';

export const Navbar: React.FC = () => {
    const location = useLocation();

    // The nav items remain the same, but we can customize icons if needed
    const navItems = [
        { path: '/', label: 'Home', icon: Sword },
        { path: '/create', label: 'Create Duel', icon: Plus },
        { path: '/explorer', label: 'Explorer', icon: Search },
        { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    ];

    return (
        // ENHANCEMENT: Frosted glass effect with a gradient border, using our new colors
        <nav className="sticky top-0 z-50 bg-[var(--bg-dark-purple)]/80 backdrop-blur-xl 
                       border-b border-transparent 
                       bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] p-[1px]
                       [clip-path:inset(0_0_-1px_0)]">
            <div className="bg-[var(--bg-dark-purple)]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20"> {/* Increased height for more presence */}
                        
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <img src={SomniaIcon} alt="Somnia Icon" className="w-14 h-14 group-hover:scale-105 transition-transform" />
                            <div className="flex flex-col">
                                {/* ENHANCEMENT: Logo text now uses the new Somnia-inspired gradient */}
                                <span className="text-xl font-bold font-display bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] bg-clip-text text-transparent">
                                    Somnia Colosseum
                                </span>
                                <span className="text-xs text-[var(--text-primary)] opacity-60 -mt-1 tracking-widest">
                                    TRADING DUELS
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        // ENHANCEMENT: Gamified active/hover states
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
                                            isActive
                                                ? 'bg-[var(--accent-purple)]/20 text-[var(--primary-cyan)] shadow-[inset_0_1px_0_rgba(0,209,255,0.2)]'
                                                : 'text-[var(--text-primary)] opacity-70 hover:opacity-100 hover:bg-[var(--border-color)]/50'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Connect Wallet */}
                        <div>
                            <ConnectButton
                                chainStatus="icon"
                                accountStatus={{
                                    smallScreen: 'avatar',
                                    largeScreen: 'full',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar (Bottom) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16
                           bg-[var(--bg-dark-purple)]/80 backdrop-blur-xl 
                           border-t border-transparent
                           bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] p-[1px]
                           [clip-path:inset(-1px_0_0_0)]">
                <div className="bg-[var(--bg-dark-purple)] h-full flex items-center justify-around">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={`mobile-${item.path}`}
                                to={item.path}
                                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200 ${
                                    isActive ? 'text-[var(--primary-cyan)]' : 'text-[var(--text-primary)] opacity-60'
                                }`}
                            >
                                {isActive && <div className="w-2 h-1 bg-[var(--primary-cyan)] rounded-full mb-1"></div>}
                                <Icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};