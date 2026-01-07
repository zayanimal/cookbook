import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../hooks/useStores'
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import DescriptionIcon from '@mui/icons-material/Description'
import AddIcon from '@mui/icons-material/Add'

const EmptyState = observer(() => {
  const { cookbookStore } = useStores()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pageTitle, setPageTitle] = useState('')

  const selectedSection = cookbookStore.getSelectedSection()
  const hasPages = selectedSection && selectedSection.pages && selectedSection.pages.length > 0

  const handleCreatePageClick = () => {
    setPageTitle('')
    setDialogOpen(true)
  }

  const handleCreatePage = async () => {
    if (selectedSection && pageTitle.trim()) {
      try {
        const pageId = await cookbookStore.addPage(selectedSection.id, pageTitle.trim())
        cookbookStore.selectPage(pageId)
        setDialogOpen(false)
        setPageTitle('')
      } catch (error) {
        alert('Ошибка создания страницы: ' + (error.message || 'Неизвестная ошибка'))
      }
    }
  }

  const handlePageClick = (pageId) => {
    cookbookStore.selectPage(pageId)
  }

  // Если выбран раздел с существующими страницами - показываем список
  if (selectedSection && hasPages) {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: '60vh',
            pt: 4,
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 800,
              width: '100%',
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Страницы раздела "{selectedSection.title}"
            </Typography>
            <List>
              {selectedSection.pages.map((page) => (
                <ListItem
                  key={page.id}
                  disablePadding
                  onClick={() => handlePageClick(page.id)}
                >
                  <ListItemButton>
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText primary={page.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          sx={{
            '& .MuiDialog-paper': {
              width: '100%',
              maxWidth: '550px',
            },
          }}
        >
          <DialogTitle>Создать новую страницу</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Название страницы"
              fullWidth
              variant="outlined"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pageTitle.trim()) {
                  handleCreatePage()
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={handleCreatePage}
              variant="contained"
              disabled={!pageTitle.trim()}
            >
              Создать
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }

  // Если выбран пустой раздел - показываем кнопку создания страницы
  if (selectedSection && !hasPages) {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 500,
            }}
          >
            <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Раздел "{selectedSection.title}" пуст
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Создайте первую страницу в этом разделе
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreatePageClick}
            >
              Создать страницу
            </Button>
          </Paper>
        </Box>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          sx={{
            '& .MuiDialog-paper': {
              width: '100%',
              maxWidth: '550px',
            },
          }}
        >
          <DialogTitle>Создать новую страницу</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Название страницы"
              fullWidth
              variant="outlined"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pageTitle.trim()) {
                  handleCreatePage()
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={handleCreatePage}
              variant="contained"
              disabled={!pageTitle.trim()}
            >
              Создать
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }

  // Если ничего не выбрано - показываем обычный EmptyState
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 500,
        }}
      >
        <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Выберите страницу для просмотра
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Выберите страницу из боковой панели или создайте новую страницу в
          разделе
        </Typography>
      </Paper>
    </Box>
  )
})

export default EmptyState

