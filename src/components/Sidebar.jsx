import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../hooks/useStores'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Box,
  Typography,
} from '@mui/material'
import {
  ExpandLess,
  ExpandMore,
  Description,
  Add,
  Edit,
  Delete,
  MoreVert,
} from '@mui/icons-material'
import styled from '@emotion/styled'

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

const SectionItem = observer(({ section, onClose }) => {
  const { cookbookStore } = useStores()
  const [expanded, setExpanded] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(section.title)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addPageDialogOpen, setAddPageDialogOpen] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')

  const isSelected = cookbookStore.selectedSectionId === section.id

  const handleClick = (e) => {
    // Проверяем, что клик не по иконке меню (она уже обрабатывается отдельно)
    if (!e.target.closest('.MuiIconButton-root')) {
      cookbookStore.selectSection(section.id)
      setExpanded(!expanded)
      if (onClose) onClose()
    }
  }

  const handleMenuOpen = (e) => {
    e.stopPropagation()
    setMenuAnchor(e.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleAddPage = () => {
    handleMenuClose()
    setNewPageTitle('')
    setAddPageDialogOpen(true)
  }

  const handleCreatePage = async () => {
    if (newPageTitle.trim()) {
      try {
        const pageId = await cookbookStore.addPage(section.id, newPageTitle.trim())
        cookbookStore.selectPage(pageId)
        setAddPageDialogOpen(false)
        setNewPageTitle('')
        if (onClose) onClose()
      } catch (error) {
        alert('Ошибка создания страницы: ' + (error.message || 'Неизвестная ошибка'))
      }
    }
  }

  const handleEditSection = () => {
    handleMenuClose()
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    try {
      await cookbookStore.updateSection(section.id, editTitle)
      setEditDialogOpen(false)
      setEditTitle(section.title)
    } catch (error) {
      alert('Ошибка обновления раздела: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  const handleDeleteSection = () => {
    handleMenuClose()
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await cookbookStore.deleteSection(section.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      alert('Ошибка удаления раздела: ' + (error.message || 'Неизвестная ошибка'))
      setDeleteDialogOpen(false)
    }
  }

  const handlePageClick = (pageId) => {
    cookbookStore.selectSection(section.id)
    cookbookStore.selectPage(pageId)
    if (onClose) onClose()
  }

  return (
    <>
      <StyledListItem
        disablePadding
        selected={isSelected}
        secondaryAction={
          <IconButton edge="end" size="small" onClick={handleMenuOpen}>
            <MoreVert fontSize="small" />
          </IconButton>
        }
      >
        <ListItemButton 
          onClick={handleClick} 
          sx={{ pl: 2, width: '100%', cursor: 'pointer' }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemIcon>
          <ListItemText
            primary={section.title}
            sx={{ flex: 1 }}
          />
        </ListItemButton>
      </StyledListItem>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {section.pages.map((page) => {
            const isPageSelected =
              cookbookStore.selectedPageId === page.id &&
              cookbookStore.selectedSectionId === section.id
            return (
              <ListItem
                key={page.id}
                disablePadding
                selected={isPageSelected}
                onClick={() => handlePageClick(page.id)}
              >
                <ListItemButton sx={{ pl: 6 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Description fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={page.title} />
                </ListItemButton>
              </ListItem>
            )
          })}
          <ListItem disablePadding>
            <ListItemButton
              sx={{ pl: 6 }}
              onClick={handleAddPage}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Add fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Добавить страницу" />
            </ListItemButton>
          </ListItem>
        </List>
      </Collapse>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleAddPage}>
          <Add fontSize="small" sx={{ mr: 1 }} />
          Добавить страницу
        </MenuItem>
        <MenuItem onClick={handleEditSection}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Редактировать раздел
        </MenuItem>
        <MenuItem onClick={handleDeleteSection}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Удалить раздел
        </MenuItem>
      </Menu>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            maxWidth: '500px',
          },
        }}>
        <DialogTitle>Редактировать раздел</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название раздела"
            fullWidth
            variant="outlined"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить раздел?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить раздел "{section.title}"? Все страницы
            в этом разделе также будут удалены.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addPageDialogOpen}
        onClose={() => setAddPageDialogOpen(false)}
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            maxWidth: '500px',
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
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newPageTitle.trim()) {
                handleCreatePage()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPageDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleCreatePage}
            variant="contained"
            disabled={!newPageTitle.trim()}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
})

const Sidebar = observer(({ onClose }) => {
  const { cookbookStore } = useStores()
  const [addSectionDialogOpen, setAddSectionDialogOpen] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [isAddingSection, setIsAddingSection] = useState(false)

  const handleAddSection = async () => {
    if (newSectionTitle.trim() && !isAddingSection) {
      setIsAddingSection(true)
      try {
        await cookbookStore.addSection(newSectionTitle.trim())
        setNewSectionTitle('')
        setAddSectionDialogOpen(false)
      } catch (error) {
        alert('Ошибка создания раздела: ' + (error.message || 'Неизвестная ошибка'))
      } finally {
        setIsAddingSection(false)
      }
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {cookbookStore.sections.map((section) => (
          <SectionItem key={section.id} section={section} onClose={onClose} />
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Add />}
          onClick={() => setAddSectionDialogOpen(true)}
        >
          Добавить раздел
        </Button>
      </Box>

      <Dialog
        open={addSectionDialogOpen}
        onClose={() => setAddSectionDialogOpen(false)}
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            maxWidth: '500px',
          },
        }}
      >
        <DialogTitle>Добавить новый раздел</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название раздела"
            fullWidth
            variant="outlined"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddSection()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSectionDialogOpen(false)} disabled={isAddingSection}>
            Отмена
          </Button>
          <Button
            onClick={handleAddSection}
            variant="contained"
            disabled={isAddingSection || !newSectionTitle.trim()}
          >
            {isAddingSection ? 'Добавление...' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
})

export default Sidebar

