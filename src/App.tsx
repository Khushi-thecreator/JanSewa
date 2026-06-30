import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import CivicStandards from './pages/CivicStandards';
import ComplaintDetail from './pages/ComplaintDetail';
import ComplaintSubmitted from './pages/ComplaintSubmitted';
import TrackStatus from './pages/TrackStatus';
import AdminDashboard from './pages/AdminDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportIssue from './pages/ReportIssue';
import WardMap from './pages/WardMap';
import Notifications from './pages/Notifications';
import HelpFAQ from './pages/HelpFAQ';

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/standards" element={<CivicStandards />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />
          <Route path="/submitted" element={<ComplaintSubmitted />} />
          <Route path="/track" element={<TrackStatus />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<CitizenDashboard />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/map" element={<WardMap />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<HelpFAQ />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
