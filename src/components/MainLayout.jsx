import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { useStores } from '../hooks/useStores'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import LogoutIcon from '@mui/icons-material/Logout'
import SearchIcon from '@mui/icons-material/Search'
import Sidebar from './Sidebar'
import PageView from './PageView'
import EmptyState from './EmptyState'
import SearchDialog from './SearchDialog'
import ResizeHandle from './ResizeHandle'
import styled from '@emotion/styled'

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}))

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}))

const MainLayout = observer(() => {
  const { cookbookStore, authStore } = useStores()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)

  useEffect(() => {
    cookbookStore.loadSections()
  }, []);

  useEffect(() => {
    cookbookStore.setSidebarOpen(!isMobile)
  }, [isMobile, cookbookStore])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const selectedPage = cookbookStore.getSelectedPage()
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)

  React.useEffect(() => {
    if (cookbookStore.error) {
      setSnackbarOpen(true)
    }
  }, [cookbookStore.error])

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
    cookbookStore.clearError()
  }

  const handleLogout = async () => {
    await authStore.logout()
    navigate('/login')
  }

  // Обработка горячей клавиши для поиска (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        setSearchDialogOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {cookbookStore.error}
        </Alert>
      </Snackbar>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        }}
      >
        <Toolbar sx={{ color: 'inherit' }}>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={isMobile ? handleDrawerToggle : () => cookbookStore.toggleSidebar()}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Cookbook
          </Typography>
          {authStore.user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                color="inherit"
                onClick={() => setSearchDialogOpen(true)}
                sx={{ mr: 1 }}
                title="Поиск"
              >
                <SearchIcon />
              </IconButton>
              <Typography variant="body2" sx={{ color: 'white', mr: 1 }}>
                {authStore.user.username}
              </Typography>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ ml: 1 }}
              >
                Выйти
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={(theme) => ({
          width: { md: cookbookStore.sidebarOpen ? cookbookStore.sidebarWidth : 0 },
          flexShrink: { md: 0 },
          overflow: 'hidden',
          height: '100vh',
          transition: cookbookStore.isResizing
            ? 'none'
            : theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          position: 'relative',
        })}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 280,
              },
            }}
          >
            <DrawerHeader>
              <Typography variant="h6" sx={{ p: 2 }}>
                Разделы
              </Typography>
            </DrawerHeader>
            <Sidebar onClose={handleDrawerToggle} />
          </Drawer>
        ) : (
          <Drawer
            variant="persistent"
            open={cookbookStore.sidebarOpen}
            sx={{
              height: '100vh',
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: cookbookStore.sidebarWidth,
                position: 'relative',
                height: '100vh',
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                transition: cookbookStore.isResizing
                  ? 'none'
                  : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              },
            }}
          >
            <DrawerHeader>
              <Typography variant="h6" sx={{ p: 2, flexGrow: 1 }}>
                Разделы
              </Typography>
              <IconButton onClick={() => cookbookStore.toggleSidebar()}>
                <ChevronLeftIcon />
              </IconButton>
            </DrawerHeader>
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Sidebar />
            </Box>
            {cookbookStore.sidebarOpen && (
              <ResizeHandle
                onResize={(width) => cookbookStore.setSidebarWidth(width)}
                onResizeStart={() => cookbookStore.setIsResizing(true)}
                onResizeEnd={() => cookbookStore.setIsResizing(false)}
                minWidth={200}
                maxWidth={600}
              />
            )}
          </Drawer>
        )}
      </Box>

      <MainContent>
        <Toolbar />
        {cookbookStore.loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh',
            }}
          >
            <CircularProgress />
          </Box>
        ) : selectedPage ? (
          <PageView />
        ) : (
          <EmptyState />
        )}
      </MainContent>
      <SearchDialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} />
    </Box>
  )
})

export default MainLayout

