import { Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { SUGGEST_ENABLED } from './config/features'
import { RequireAuth } from './components/RequireAuth'
import { RequireOnboarding } from './components/RequireOnboarding'
import { AuthProvider } from './hooks/useAuth'
import { SettingsProvider } from './hooks/useSettings'
import { HomeScreen } from './screens/HomeScreen'
import {
  ExerciseDetailScreen,
  HistoryScreen,
  NotFoundScreen,
  PlanScreen,
  preloadScreens,
  ProfileScreen,
  ProgressScreen,
  ResetPasswordScreen,
  SessionDetailScreen,
  SettingsScreen,
  SuggestScreen,
  TemplateScreen,
  WeighInScreen,
  WelcomeScreen,
  WorkoutScreen,
} from './screens/lazy'
import { LoginScreen } from './screens/LoginScreen'

export default function App() {
  useEffect(preloadScreens, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          {/* Navigations are transitions, so the current screen stays up while a chunk loads. */}
          <Suspense fallback={null}>
            <Routes>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/reset-password" element={<ResetPasswordScreen />} />
              <Route element={<RequireAuth />}>
                <Route path="welcome" element={<WelcomeScreen />} />
                <Route element={<RequireOnboarding />}>
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
              </Route>
            </Routes>
          </Suspense>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
