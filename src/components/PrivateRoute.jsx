import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useStores } from '../hooks/useStores'
import { Box, CircularProgress } from '@mui/material'

/**
 * Компонент для защиты приватных маршрутов
 * Перенаправляет на страницу входа, если пользователь не авторизован
 */
const PrivateRoute = observer(({ children }) => {
  const { authStore } = useStores()

  useEffect(() => {
    // Если есть токен, но пользователь не загружен и не идет загрузка, пытаемся загрузить
    if (authStore.isAuthenticated && !authStore.user && !authStore.loading) {
      authStore.fetchCurrentUser().catch(() => {
        // Если не удалось загрузить пользователя, токен недействителен
        authStore.logout()
      })
    }
  }, [authStore])

  // Показываем загрузку, если идет инициализация авторизации или загрузка пользователя
  if (authStore.loading || (authStore.isAuthenticated && !authStore.user)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
})

export default PrivateRoute

