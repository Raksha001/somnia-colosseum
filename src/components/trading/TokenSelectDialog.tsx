import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import { type Token, DEFAULT_TOKENS } from '../../../lib/constants';

interface TokenSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
}

export const TokenSelectDialog: React.FC<TokenSelectDialogProps> = ({ isOpen, onClose, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const filteredTokens = DEFAULT_TOKENS.filter(token =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[101] flex items-center justify-center p-4">
            <div className="relative font-display bg-[var(--bg-dark-purple)]/80 border border-[var(--border-color)] rounded-2xl max-w-sm w-full space-y-4 animate-fade-in-up flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold text-white">Select a Token</h2>
                    <button onClick={onClose} className="p-2 text-[var(--text-primary)]/70 hover:text-white hover:bg-[var(--border-color)]/50 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-primary)] opacity-60" />
                        <input
                            type="text"
                            placeholder="Search by name or symbol"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-black/30 border border-[var(--border-color)] rounded text-white placeholder:opacity-60 focus:border-[var(--primary-cyan)] focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    <div className="space-y-2">
                        {filteredTokens.map(token => (
                            <button
                                key={token.address}
                                onClick={() => {
                                    onSelect(token);
                                    onClose();
                                }}
                                className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-[var(--border-color)]/50 transition-colors"
                            >
                                {/* <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" /> */}
                                <div className="text-left">
                                    <div className="text-white font-semibold">{token.symbol}</div>
                                    <div className="text-[var(--text-primary)] opacity-70 text-sm">{token.name}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body // Renders the dialog at the top level of the page
    );
};