import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './visitor.css';

const Landing = lazy(() => import('./pages/Landing'));
const EmergencyKit = lazy(() => import('./pages/EmergencyKit'));
const Resources = lazy(() => import('./pages/Resources'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/preparedforanything">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/emergency-kit" element={<Layout><EmergencyKit /></Layout>} />
          <Route path="/resources" element={<Layout><Resources /></Layout>} />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
