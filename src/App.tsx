import { ThemeProvider } from './context/ThemeContext';
import { FilterProvider } from './context/FilterContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import './index.css';

export default function App() {
  return (
    <ThemeProvider>
      <FilterProvider>
        <div className="min-h-screen">
          <Header />
          <Dashboard />
        </div>
      </FilterProvider>
    </ThemeProvider>
  );
}
