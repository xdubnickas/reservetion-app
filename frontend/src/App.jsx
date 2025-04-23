import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  MyNavbar,
  SuggestedEvents,
  EventExplorer,
  Footer,
  ProtectedRoute,
  AuthRedirect,
  AuthValidator
} from './components/common';
import SignUpPage from './pages/SignUpPage';
import SpaceRenterPage from './pages/SpaceRenterPage';
import EventOrganizerPage from './pages/EventOrganizerPage';
import MyReservationsPage from './pages/MyReservationsPage';
import PreferencesPage from './pages/PreferencesPage';
import EventDetailPage from './pages/EventDetailPage';
import LocalityDetailPage from './pages/LocalityDetailPage'; // Import the new page
import AboutUs from './pages/AboutUs'; // Import the About Us page
import LocalitiesPage from './pages/LocalitiesPage'; // Import the Localities page
import EventsPage from './pages/EventsPage'; // Import the Events page
import ContactPage from './pages/ContactPage'; // Import the Contact page
import CategoriesPage from './pages/CategoriesPage'; // Import the Categories page
import ProfileSettings from './pages/ProfileSettings'; // Import the Profile Settings page
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="app-container">
          <AuthValidator />
          <AuthRedirect />
          <MyNavbar />
          <Routes>
            <Route path="/" element={
              <div className="responsive-content">
                <SuggestedEvents />
                <EventExplorer />
              </div>
            } />
            <Route path="/signup" element={<SignUpPage />} />
            <Route 
              path="/space-renter" 
              element={
                <ProtectedRoute allowedRoles={['SPACE_RENTER']}>
                  <SpaceRenterPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/event-organizer" 
              element={
                <ProtectedRoute allowedRoles={['EVENT_ORGANIZER']}>
                  <EventOrganizerPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/my-reservations" element={<MyReservationsPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/localities/:id" element={<LocalityDetailPage />} />
            <Route path="/localities" element={<LocalitiesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route 
              path="/profile-settings" 
              element={
                <ProtectedRoute allowedRoles={['REGISTERED_USER', 'SPACE_RENTER', 'EVENT_ORGANIZER']}>
                  <ProfileSettings />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Footer />
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
