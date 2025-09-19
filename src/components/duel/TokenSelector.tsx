import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';
import { type Token } from '../../lib/constants';


const DEFAULT_TOKENS = [
  {
    address: '0x4A3BC48C156384f9564Fd65A53a2f3D534D8f2b7',
    symbol: 'WSTT',
    name: 'Wrapped Somnia Testnet Tokens',
    decimals: 6
  },
  {
    address: '0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76',
    symbol: 'USDT.g',
    name: 'Tether USD.g',
    decimals: 6
  },
  {
    address: '0xF2F773753cEbEFaF9b68b841d80C083b18C69311',
    symbol: 'NIA',
    name: 'NIA Token',
    decimals: 18
  }
];
// The useOnClickOutside helper hook remains the same
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

// The Dropdown component, simplified by removing the `isLoading` prop
const TokenDropdown = ({ targetRect, onSelect, onClose, filteredTokens, searchQuery, setSearchQuery }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(dropdownRef, onClose);

    if (!targetRect) return null;

    return ReactDOM.createPortal(
        <div
            ref={dropdownRef}
            style={{
                position: 'absolute',
                top: `${targetRect.bottom + 8}px`,
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
                {/* The loading state is removed, as the data is available instantly */}
                {filteredTokens.length > 0 ? (
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

// The main TokenSelector component, now using the static DEFAULT_TOKENS array
export const TokenSelector: React.FC<{ selectedToken: Token | null, onTokenSelect: (token: Token) => void }> = ({ selectedToken, onTokenSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    // The useTokens hook has been removed.

    // The filtering logic now operates on the static DEFAULT_TOKENS array.
    const filteredTokens = useMemo(() => {
        if (!searchQuery) {
            return DEFAULT_TOKENS; // Return all tokens if search is empty
        }
        return DEFAULT_TOKENS.filter(token =>
            token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]); // The dependency is now only `searchQuery`

    useLayoutEffect(() => {
        if (isOpen && buttonRef.current) {
            setTargetRect(buttonRef.current.getBoundingClientRect());
        }
    }, [isOpen]);

    const handleSelect = (token: Token) => {
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
                    filteredTokens={filteredTokens}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    // isLoading prop is no longer needed
                />
            )}
        </div>
    );
};