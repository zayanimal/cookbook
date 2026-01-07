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
} from '@mui/material'
import DescriptionIcon from '@mui/icons-material/Description'
import AddIcon from '@mui/icons-material/Add'

const EmptyState = observer(() => {
  const { cookbookStore } = useStores()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pageTitle, setPageTitle] = useState('')

  const handleCreatePageClick = () => {
    setPageTitle('')
    setDialogOpen(true)
  }

  const handleCreatePage = async () => {
    const section = cookbookStore.sections[0]
    if (section && pageTitle.trim()) {
      try {
        const pageId = await cookbookStore.addPage(section.id, pageTitle.trim())
        cookbookStore.selectSection(section.id)
        cookbookStore.selectPage(pageId)
        setDialogOpen(false)
        setPageTitle('')
      } catch (error) {
        alert('Ошибка создания страницы: ' + (error.message || 'Неизвестная ошибка'))
      }
    }
  }

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
        {cookbookStore.sections.length > 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePageClick}
          >
            Создать страницу
          </Button>
        )}
      </Paper>

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
    </Box>
  )
})

export default EmptyState

