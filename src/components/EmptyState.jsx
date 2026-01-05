import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../hooks/useStores'
import { Box, Typography, Paper, Button } from '@mui/material'
import DescriptionIcon from '@mui/icons-material/Description'
import AddIcon from '@mui/icons-material/Add'

const EmptyState = observer(() => {
  const { cookbookStore } = useStores()

  const handleCreatePage = async () => {
    const section = cookbookStore.sections[0]
    if (section) {
      const title = prompt('Введите название страницы:')
      if (title) {
        try {
          const pageId = await cookbookStore.addPage(section.id, title)
          cookbookStore.selectSection(section.id)
          cookbookStore.selectPage(pageId)
        } catch (error) {
          alert('Ошибка создания страницы: ' + (error.message || 'Неизвестная ошибка'))
        }
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
            onClick={handleCreatePage}
          >
            Создать страницу
          </Button>
        )}
      </Paper>
    </Box>
  )
})

export default EmptyState

