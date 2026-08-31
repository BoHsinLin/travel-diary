import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';
import { TripLayout } from '../components/navigation/TripLayout';

const TodayPage = lazy(() => import('../features/today/TodayPage').then((module) => ({ default: module.TodayPage })));
const PlannerPage = lazy(() => import('../features/itinerary/PlannerPage').then((module) => ({ default: module.PlannerPage })));
const ExplorePage = lazy(() => import('../features/places/PlaceFlowPages').then((module) => ({ default: module.ExplorePage })));
const AddPlacePage = lazy(() => import('../features/places/PlaceFlowPages').then((module) => ({ default: module.AddPlacePage })));
const ConflictPage = lazy(() => import('../features/places/PlaceFlowPages').then((module) => ({ default: module.ConflictPage })));
const PlaceDetailsPage = lazy(() => import('../features/places/ExtendedFlowPages').then((module) => ({ default: module.PlaceDetailsPage })));
const EditItineraryPage = lazy(() => import('../features/places/ExtendedFlowPages').then((module) => ({ default: module.EditItineraryPage })));
const FlightReschedulePage = lazy(() => import('../features/places/ExtendedFlowPages').then((module) => ({ default: module.FlightReschedulePage })));
const QuickAdjustPage = lazy(() => import('../features/places/ExtendedFlowPages').then((module) => ({ default: module.QuickAdjustPage })));
const LoginPage = lazy(() => import('../features/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const TripListPage = lazy(() => import('../features/trips/TripPages').then((module) => ({ default: module.TripListPage })));
const TripOverviewPage = lazy(() => import('../features/trips/TripPages').then((module) => ({ default: module.TripOverviewPage })));
const PeoplePage = lazy(() => import('../features/trips/ManagementPages').then((module) => ({ default: module.PeoplePage })));
const SettingsPage = lazy(() => import('../features/trips/ManagementPages').then((module) => ({ default: module.SettingsPage })));
const BudgetPage = lazy(() => import('../features/trips/ManagementPages').then((module) => ({ default: module.BudgetPage })));
const NotFoundPage = lazy(() => import('../features/system/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

export function App() {
  return <><Suspense fallback={<main className="route-loading" aria-busy="true">正在載入頁面…</main>}><Routes>
    <Route path="/" element={<Navigate replace to="/trips" />} />
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/trips" element={<TripListPage />} />
      <Route element={<TripLayout />}>
        <Route path="/trips/:tripId/overview" element={<TripOverviewPage />} />
        <Route path="/trips/:tripId/people" element={<PeoplePage />} />
        <Route path="/trips/:tripId/settings" element={<SettingsPage />} />
        <Route path="/trips/:tripId/budget" element={<BudgetPage />} />
        <Route path="/trips/:tripId/today" element={<TodayPage />} />
        <Route path="/trips/:tripId/plan" element={<PlannerPage />} />
        <Route path="/trips/:tripId/places" element={<ExplorePage />} />
        <Route path="/trips/:tripId/places/:placeId" element={<PlaceDetailsPage />} />
        <Route path="/trips/:tripId/plan/add/:placeId" element={<AddPlacePage />} />
        <Route path="/trips/:tripId/plan/conflict/:placeId" element={<ConflictPage />} />
        <Route path="/trips/:tripId/plan/edit/:itemId" element={<EditItineraryPage />} />
        <Route path="/trips/:tripId/plan/quick-adjust" element={<QuickAdjustPage />} />
        <Route path="/trips/:tripId/plan/flight-change/:itemId" element={<FlightReschedulePage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense><PwaUpdatePrompt /></>;
}
