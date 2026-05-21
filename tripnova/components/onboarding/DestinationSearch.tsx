import React, { useState } from 'react';
import { Search, MapPin, Check, X } from 'lucide-react';

interface DestinationSearchProps {
  selectedDestinations: string[];
  onChange: (destinations: string[]) => void;
  suggestions?: string[];
}

export function DestinationSearch({
  selectedDestinations,
  onChange,
  suggestions = ['Goa', 'Bali', 'Dubai', 'Kashmir', 'Thailand', 'Europe', 'Kerala', 'Manali'],
}: DestinationSearchProps) {
  const [query, setQuery] = useState('');

  const filteredSuggestions = suggestions.filter((dest) =>
    dest.toLowerCase().includes(query.toLowerCase())
  );

  const toggleSelect = (value: string) => {
    const isSelected = selectedDestinations.includes(value);
    if (isSelected) {
      onChange(selectedDestinations.filter((item) => item !== value));
    } else {
      onChange([...selectedDestinations, value]);
    }
  };

  const handleCustomAdd = () => {
    if (query.trim() && !selectedDestinations.includes(query.trim())) {
      onChange([...selectedDestinations, query.trim()]);
      setQuery('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4.5 w-4.5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCustomAdd();
            }
          }}
          placeholder="Search locations or add custom destinations..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/40 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
      </div>

      {/* Suggested Destination Tag list */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
          Trending Suggestions
        </span>
        <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
          {filteredSuggestions.map((dest) => {
            const isSelected = selectedDestinations.includes(dest);
            return (
              <button
                key={dest}
                type="button"
                onClick={() => toggleSelect(dest)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-violet-500/20 border-violet-500 text-white'
                    : 'bg-zinc-900/60 border-zinc-800/85 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{dest}</span>
                {isSelected && <Check className="h-3 w-3 text-violet-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom item adder */}
      {query.trim() && !suggestions.map((s) => s.toLowerCase()).includes(query.trim().toLowerCase()) && (
        <button
          type="button"
          onClick={handleCustomAdd}
          className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
        >
          + Add &quot;{query.trim()}&quot; as a custom destination
        </button>
      )}

      {/* Selected Tags list */}
      {selectedDestinations.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
            Selected Destinations ({selectedDestinations.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedDestinations.map((dest) => (
              <span
                key={dest}
                className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-1.5"
              >
                <span>{dest}</span>
                <button
                  type="button"
                  onClick={() => toggleSelect(dest)}
                  className="p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
