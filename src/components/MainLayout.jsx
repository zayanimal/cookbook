import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
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
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import Sidebar from './Sidebar'
import PageView from './PageView'
import EmptyState from './EmptyState'
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

const drawerWidth = 280

const MainLayout = observer(() => {
  const { cookbookStore } = useStores()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

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

  return (
    <Box sx={{ display: 'flex' }}>
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
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={isMobile ? handleDrawerToggle : () => cookbookStore.toggleSidebar()}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Cookbook - Инженерные системы дома
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={(theme) => ({
          width: { md: cookbookStore.sidebarOpen ? drawerWidth : 0 },
          flexShrink: { md: 0 },
          overflow: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
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
                width: drawerWidth,
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
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
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
            <Sidebar />
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
    </Box>
  )
})

export default MainLayout

