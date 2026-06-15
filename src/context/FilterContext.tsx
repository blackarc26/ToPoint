import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface FilterContextType {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  keywordFilter: string;
  setKeywordFilter: (k: string) => void;
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
}

const FilterContext = createContext<FilterContextType>({
  searchQuery: '', setSearchQuery: () => {},
  keywordFilter: '', setKeywordFilter: () => {},
  dateFrom: '', setDateFrom: () => {},
  dateTo: '', setDateTo: () => {},
});

export function FilterProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  return (
    <FilterContext.Provider value={{ searchQuery, setSearchQuery, keywordFilter, setKeywordFilter, dateFrom, setDateFrom, dateTo, setDateTo }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => useContext(FilterContext);
