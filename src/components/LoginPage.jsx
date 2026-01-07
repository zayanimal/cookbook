import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { useStores } from '../hooks/useStores'
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import styled from '@emotion/styled'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: 'auto',
  marginTop: theme.spacing(8),
}))

const LoginPage = observer(() => {
  const { authStore } = useStores()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  // Перенаправляем на главную страницу, если пользователь уже авторизован
  useEffect(() => {
    if (authStore.isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [authStore.isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!username.trim() || !password.trim()) {
      setLocalError('Пожалуйста, заполните все поля')
      return
    }

    try {
      await authStore.login(username, password)
      // После успешной авторизации перенаправляем на главную страницу
      navigate('/', { replace: true })
    } catch (error) {
      setLocalError(error.message || 'Ошибка авторизации')
    }
  }

  const errorMessage = localError || authStore.error

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper elevation={3}>
        <Typography component="h1" variant="h4" gutterBottom>
          Cookbook
        </Typography>
        <Typography component="h2" variant="h6" color="text.secondary" gutterBottom>
          Вход в систему
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Имя пользователя"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={authStore.loading}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={authStore.loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={authStore.loading}
          >
            {authStore.loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Войти'
            )}
          </Button>
        </Box>
      </StyledPaper>
    </Container>
  )
})

export default LoginPage

