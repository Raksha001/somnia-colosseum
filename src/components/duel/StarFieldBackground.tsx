import React from 'react';

export const StarfieldBackground: React.FC = () => {
    // Generate star positions for different layers
    const generateStars = (count: number, layerClass: string) => {
        return Array.from({ length: count }, (_, i) => (
            <div
                key={i}
                className={`absolute rounded-full ${layerClass}`}
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 20}s`,
                }}
            />
        ));
    };

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Background cosmic dust */}
            <div className="absolute inset-0 opacity-30">
                <div 
                    className="absolute inset-0"
                    style={{
                        background: `
                            radial-gradient(ellipse 400px 200px at 20% 30%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
                            radial-gradient(ellipse 300px 150px at 80% 70%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
                            radial-gradient(ellipse 200px 300px at 40% 80%, rgba(128, 0, 255, 0.1) 0%, transparent 50%)
                        `
                    }}
                />
            </div>

            {/* Distant stars - Layer 1 (Slowest, smallest) */}
            <div className="absolute inset-0">
                {generateStars(80, 'star-distant w-px h-px bg-white opacity-60')}
            </div>

            {/* Mid-distance stars - Layer 2 */}
            <div className="absolute inset-0">
                {generateStars(40, 'star-mid w-0.5 h-0.5 bg-cyan-200 opacity-70')}
            </div>

            {/* Close stars - Layer 3 (Fastest, largest) */}
            <div className="absolute inset-0">
                {generateStars(20, 'star-close w-1 h-1 bg-white opacity-80')}
            </div>

            {/* Bright accent stars with colors */}
            <div className="absolute inset-0">
                {generateStars(8, 'star-accent w-1.5 h-1.5 bg-cyan-400 opacity-90')}
            </div>

            {/* Shooting stars */}
            <div className="absolute top-16 -left-32 w-1 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80 shooting-star" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/3 -left-40 w-1 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70 shooting-star" style={{ animationDelay: '8s' }} />
            <div className="absolute top-2/3 -left-36 w-1 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-60 shooting-star" style={{ animationDelay: '15s' }} />

            {/* Nebula clouds */}
            <div 
                className="absolute top-16 right-16 w-96 h-64 rounded-full opacity-10 blur-3xl bg-gradient-radial from-cyan-400 to-transparent"
                style={{ animation: 'nebula-drift 40s ease-in-out infinite' }}
            />
            <div 
                className="absolute bottom-32 left-16 w-80 h-48 rounded-full opacity-8 blur-3xl bg-gradient-radial from-pink-400 to-transparent"
                style={{ animation: 'nebula-drift 50s ease-in-out infinite reverse 10s' }}
            />

            {/* Pulsing distant galaxies */}
            <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-purple-400 opacity-40 galaxy-pulse" style={{ animationDelay: '0s' }} />
            <div className="absolute top-3/4 right-1/4 w-3 h-3 rounded-full bg-cyan-300 opacity-50 galaxy-pulse" style={{ animationDelay: '3s' }} />
            <div className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-pink-300 opacity-60 galaxy-pulse" style={{ animationDelay: '6s' }} />

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes twinkle-distant {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.2); }
                }

                @keyframes twinkle-mid {
                    0%, 100% { opacity: 0.4; transform: scale(1) translateY(0px); }
                    25% { opacity: 0.9; transform: scale(1.3) translateY(-2px); }
                    75% { opacity: 0.6; transform: scale(1.1) translateY(2px); }
                }

                @keyframes twinkle-close {
                    0%, 100% { opacity: 0.6; transform: scale(1) translateY(0px) translateX(0px); }
                    33% { opacity: 1; transform: scale(1.4) translateY(-3px) translateX(-1px); }
                    66% { opacity: 0.8; transform: scale(1.2) translateY(3px) translateX(1px); }
                }

                @keyframes twinkle-accent {
                    0%, 100% { 
                        opacity: 0.7; 
                        transform: scale(1);
                        box-shadow: 0 0 5px currentColor;
                    }
                    50% { 
                        opacity: 1; 
                        transform: scale(1.6);
                        box-shadow: 0 0 15px currentColor, 0 0 25px currentColor;
                    }
                }

                @keyframes shooting-star {
                    0% { 
                        transform: translateX(0) translateY(0) scaleX(0);
                        opacity: 0;
                    }
                    10% { 
                        transform: translateX(50px) translateY(20px) scaleX(1);
                        opacity: 1;
                    }
                    100% { 
                        transform: translateX(400px) translateY(160px) scaleX(0);
                        opacity: 0;
                    }
                }

                @keyframes nebula-drift {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.1; }
                    50% { transform: translate(20px, -30px) rotate(180deg); opacity: 0.15; }
                }

                @keyframes galaxy-pulse {
                    0%, 100% { 
                        opacity: 0.2; 
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.8; 
                        transform: scale(1.8);
                        box-shadow: 0 0 10px currentColor;
                    }
                }

                .star-distant {
                    animation: twinkle-distant 4s ease-in-out infinite;
                }

                .star-mid {
                    animation: twinkle-mid 3s ease-in-out infinite;
                }

                .star-close {
                    animation: twinkle-close 2.5s ease-in-out infinite;
                }

                .star-accent {
                    animation: twinkle-accent 2s ease-in-out infinite;
                }

                .shooting-star {
                    animation: shooting-star 3s ease-out infinite;
                }

                .galaxy-pulse {
                    animation: galaxy-pulse 6s ease-in-out infinite;
                }

                .bg-gradient-radial {
                    background: radial-gradient(circle, currentColor 0%, transparent 70%);
                }
            `}</style>
        </div>
    );
};