import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { SUGGEST_ENABLED } from './config/features'
import { RequireAuth } from './components/RequireAuth'
import { AuthProvider } from './hooks/useAuth'
import { SettingsProvider } from './hooks/useSettings'
import { ExerciseDetailScreen } from './screens/ExerciseDetailScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LoginScreen } from './screens/LoginScreen'
import { NotFoundScreen } from './screens/NotFoundScreen'
import { PlanScreen } from './screens/PlanScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { ProgressScreen } from './screens/ProgressScreen'
import { SessionDetailScreen } from './screens/SessionDetailScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SuggestScreen } from './screens/SuggestScreen'
import { TemplateScreen } from './screens/TemplateScreen'
import { WeighInScreen } from './screens/WeighInScreen'
import { WorkoutScreen } from './screens/WorkoutScreen'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route index element={<HomeScreen />} />
                <Route path="workout/:id" element={<WorkoutScreen />} />
                <Route path="session/:id" element={<SessionDetailScreen />} />
                <Route path="plan" element={<PlanScreen />} />
                <Route path="plan/templates/:id" element={<TemplateScreen />} />
                <Route path="suggest" element={SUGGEST_ENABLED ? <SuggestScreen /> : <Navigate to="/" replace />} />
                <Route path="progress" element={<ProgressScreen />} />
                <Route path="exercises/:id" element={<ExerciseDetailScreen />} />
                <Route path="history" element={<HistoryScreen />} />
                <Route path="weigh-in" element={<WeighInScreen />} />
                <Route path="profile" element={<ProfileScreen />} />
                <Route path="settings" element={<SettingsScreen />} />
                <Route path="*" element={<NotFoundScreen />} />
              </Route>
            </Route>
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
