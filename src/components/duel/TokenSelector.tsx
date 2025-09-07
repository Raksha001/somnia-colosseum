import React, { useState, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';
import { useTokens } from '../../hooks/useTokens';

// A helper hook to detect clicks outside an element
function useOnClickOutside(ref: React.RefObject<HTMLDivElement>, handler: () => void) {
    React.useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

// The Dropdown component that will be rendered in a Portal
const TokenDropdown = ({ targetRect, onSelect, onClose, tokens, isLoading, searchQuery, setSearchQuery }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(dropdownRef, onClose);

    if (!targetRect) return null;

    const filteredTokens = tokens?.filter(token =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return ReactDOM.createPortal(
        <div
            ref={dropdownRef}
            style={{
                position: 'absolute',
                top: `${targetRect.bottom + 8}px`, // Position below the button with a gap
                left: `${targetRect.left}px`,
                width: `${targetRect.width}px`,
            }}
            className="bg-[var(--bg-dark-purple)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-lg z-[9999] max-h-80 overflow-hidden flex flex-col font-display animate-fade-in-up"
        >
            <div className="p-3 border-b border-[var(--border-color)]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-primary)] opacity-60" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-black/30 border border-[var(--border-color)] rounded text-white placeholder:opacity-60 focus:border-[var(--primary-cyan)] focus:outline-none transition-colors"
                        autoFocus
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (<div className="p-4 text-center opacity-70">Loading...</div>)
                : filteredTokens.length > 0 ? (
                    filteredTokens.map((token) => (
                        <button key={token.address} onClick={() => onSelect(token)} className="w-full p-3 flex items-center space-x-3 hover:bg-[var(--border-color)]/50 transition-colors text-left">
                            <div>
                                <div className="text-white font-semibold">{token.symbol}</div>
                                <div className="text-[var(--text-primary)] opacity-70 text-sm">{token.name}</div>
                            </div>
                        </button>
                    ))
                ) : (<div className="p-4 text-center opacity-70">No tokens found</div>)}
            </div>
        </div>,
        document.getElementById('portal-root')!
    );
};

// The main TokenSelector component
export const TokenSelector: React.FC<{ selectedToken: any, onTokenSelect: (token: any) => void }> = ({ selectedToken, onTokenSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const { data: tokens, isLoading } = useTokens();
    const buttonRef = useRef<HTMLButtonElement>(null);

    useLayoutEffect(() => {
        if (isOpen && buttonRef.current) {
            setTargetRect(buttonRef.current.getBoundingClientRect());
        }
    }, [isOpen]);

    const handleSelect = (token: any) => {
        onTokenSelect(token);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="relative font-display">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 bg-[var(--bg-dark-purple)]/50 border border-[var(--border-color)] rounded-lg text-left flex items-center justify-between hover:border-[var(--primary-cyan)] transition-colors duration-200"
            >
                <div className="flex items-center space-x-3">
                    {selectedToken ? (
                        <div>
                            <div className="text-white font-bold text-lg">{selectedToken.symbol}</div>
                            <div className="text-[var(--text-primary)] opacity-70 text-sm">{selectedToken.name}</div>
                        </div>
                    ) : (
                        <div className="text-[var(--text-primary)] opacity-70">Select a token</div>
                    )}
                </div>
                <ChevronDown className={`w-5 h-5 text-[var(--text-primary)] opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <TokenDropdown
                    targetRect={targetRect}
                    onSelect={handleSelect}
                    onClose={() => setIsOpen(false)}
                    tokens={tokens}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            )}
        </div>
    );
};