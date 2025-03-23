
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import TimetableEditor from './pages/TimetableEditor';
import ViewTimetables from './pages/ViewTimetables';
import DataInput from './pages/DataInput';
import Settings from './pages/Settings';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { Toaster } from './components/ui/toaster';

function App() {
  // Initialize theme on app startup
  useEffect(() => {
    // Check if user has a theme preference
    const storedTheme = localStorage.getItem('theme');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    // Apply theme based on preference or system default
    const theme = storedTheme || systemPreference;
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Index />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="timetable-editor" element={<TimetableEditor />} />
          <Route path="view-timetables" element={<ViewTimetables />} />
          <Route path="data-input" element={<DataInput />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
