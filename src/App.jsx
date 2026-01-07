import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useStores } from './hooks/useStores'
import MainLayout from './components/MainLayout'
import LoginPage from './components/LoginPage'
import PrivateRoute from './components/PrivateRoute'

const App = observer(() => {
  const { authStore } = useStores()

  useEffect(() => {
    // Инициализируем авторизацию при загрузке приложения
    authStore.initializeAuth()
  }, [authStore])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
})

export default App

