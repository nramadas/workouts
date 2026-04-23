import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './views/Dashboard';
import Workout from './views/Workout';
import WorkoutDay from './views/WorkoutDay';
import WorkoutLog from './views/WorkoutLog';
import WorkoutSession from './views/WorkoutSession';
import Progress from './views/Progress';
import Mobility from './views/Mobility';
import Settings from './views/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="workout" element={<Workout />} />
        <Route path="workout/:dayId" element={<WorkoutDay />} />
        <Route path="workout/:dayId/log" element={<WorkoutLog />} />
        <Route path="workout/:dayId/session/:sessionId" element={<WorkoutSession />} />
        <Route path="progress" element={<Progress />} />
        <Route path="mobility" element={<Mobility />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
