import React from 'react';

interface DurationSelectorProps {
    duration: number;
    onDurationChange: (duration: number) => void;
}

const durationOptions = [
    { label: '3 Mins', value: 180 }, { label: '1 Hour', value: 3600 }, { label: '12 Hours', value: 43200 },
    { label: '24 Hours', value: 86400 }, { label: '3 Days', value: 259200 }, { label: '7 Days', value: 604800 },
];

export const DurationSelector: React.FC<DurationSelectorProps> = ({ duration, onDurationChange }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-display">
            {durationOptions.map((option) => (
                <button key={option.value} onClick={() => onDurationChange(option.value)} className={`p-4 border rounded-lg transition-all duration-200 text-center font-semibold ${
                    duration === option.value
                        ? 'bg-[var(--primary-cyan)] border-[var(--primary-cyan)] text-black shadow-[0_0_15px_var(--primary-cyan)]'
                        : 'bg-black/20 border-[var(--border-color)] opacity-70 hover:opacity-100 hover:border-[var(--primary-cyan)]'
                }`}>
                    {option.label}
                </button>
            ))}
        </div>
    );
};