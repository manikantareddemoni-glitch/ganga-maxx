import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { countries } from '../data/countries';

export function CountrySelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedCountry = countries.find(c => c.dial_code === value) || countries.find(c => c.code === 'in');

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.dial_code.includes(search)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-28 h-12 flex items-center justify-between rounded-xl border border-white/10 bg-[#030712]/50 px-3 text-sm font-medium text-white shadow-inner outline-none transition-all hover:border-indigo-500/50 focus:border-indigo-500 focus:bg-[#030712] focus:ring-1 focus:ring-indigo-500"
      >
        <div className="flex items-center gap-2">
          <img 
            src={`https://flagcdn.com/w20/${selectedCountry.code}.png`} 
            srcSet={`https://flagcdn.com/w40/${selectedCountry.code}.png 2x`}
            alt={selectedCountry.name}
            className="w-5 rounded-[2px]"
          />
          <span className="font-bold">{selectedCountry.dial_code}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-14 z-50 w-72 rounded-xl border border-white/10 bg-[#0A1128]/95 p-2 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
          >
            <div className="relative mb-2">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search country or code..." 
                className="w-full rounded-lg border border-white/5 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:bg-[#030712]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1">
              {filteredCountries.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">No countries found</div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onChange(country.dial_code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10 ${value === country.dial_code ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://flagcdn.com/w20/${country.code}.png`} 
                        srcSet={`https://flagcdn.com/w40/${country.code}.png 2x`}
                        alt={country.name}
                        className="w-5 rounded-[2px]"
                      />
                      <span className="text-sm">{country.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold opacity-70">{country.dial_code}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
