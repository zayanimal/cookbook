import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { useStores } from '../hooks/useStores'
import { slugify } from '../utils/slug'
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
  FolderOpen,
} from '@mui/icons-material'
import styled from '@emotion/styled'

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

const SubsectionItem = observer(({ section, subsection, onClose }) => {
  const { cookbookStore, authStore } = useStores()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(
    () => cookbookStore.selectedSubsectionId === subsection.id
  )
  const [menuAnchor, setMenuAnchor] = useState(null)

  useEffect(() => {
    if (cookbookStore.selectedSubsectionId === subsection.id) {
      setExpanded(true)
    }
  }, [cookbookStore.selectedSubsectionId, subsection.id])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(subsection.title)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addPageDialogOpen, setAddPageDialogOpen] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')

  const isSelected =
    cookbookStore.selectedSubsectionId === subsection.id &&
    cookbookStore.selectedSectionId === section.id

  const handleClick = (e) => {
    if (!e.target.closest('.MuiIconButton-root')) {
      setExpanded(!expanded)
    }
  }

  const handleMenuOpen = (e) => {
    e.stopPropagation()
    setMenuAnchor(e.currentTarget)
  }

  const handleMenuClose = () => setMenuAnchor(null)

  const handleAddPage = () => {
    handleMenuClose()
    setNewPageTitle('')
    setAddPageDialogOpen(true)
  }

  const handleCreatePage = async () => {
    if (newPageTitle.trim()) {
      try {
        const pageId = await cookbookStore.addPage(
          section.id,
          subsection.id,
          newPageTitle.trim()
        )
        setAddPageDialogOpen(false)
        setNewPageTitle('')
        const newPage = subsection.pages?.find((p) => p.id === pageId)
        if (newPage) {
          navigate(
            `/${slugify(section.title)}/${slugify(subsection.title)}/${slugify(newPage.title)}`
          )
        }
        if (onClose) onClose()
      } catch (error) {
        alert('Ошибка создания страницы: ' + (error.message || 'Неизвестная ошибка'))
      }
    }
  }

  const handleEditSubsection = () => {
    handleMenuClose()
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    try {
      await cookbookStore.updateSubsection(section.id, subsection.id, editTitle)
      setEditDialogOpen(false)
      setEditTitle(subsection.title)
    } catch (error) {
      alert('Ошибка обновления подраздела: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  const handleDeleteSubsection = () => {
    handleMenuClose()
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await cookbookStore.deleteSubsection(section.id, subsection.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      alert('Ошибка удаления подраздела: ' + (error.message || 'Неизвестная ошибка'))
      setDeleteDialogOpen(false)
    }
  }

  const handlePageClick = (page) => {
    navigate(
      `/${slugify(section.title)}/${slugify(subsection.title)}/${slugify(page.title)}`
    )
    if (onClose) onClose()
  }

  const pages = subsection.pages || []

  return (
    <>
      <ListItem
        disablePadding
        selected={isSelected}
        secondaryAction={
          authStore.canEdit && (
            <IconButton edge="end" size="small" onClick={handleMenuOpen}>
              <MoreVert fontSize="small" />
            </IconButton>
          )
        }
      >
        <ListItemButton
          onClick={handleClick}
          sx={{ pl: 3.5, py: 0.5, width: '100%', cursor: 'pointer' }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemIcon>
          <ListItemIcon sx={{ minWidth: 28 }}>
            <FolderOpen fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={subsection.title} sx={{ flex: 1 }} />
        </ListItemButton>
      </ListItem>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {pages.map((page) => {
            const isPageSelected =
              cookbookStore.selectedPageId === page.id &&
              cookbookStore.selectedSubsectionId === subsection.id &&
              cookbookStore.selectedSectionId === section.id
            return (
              <ListItem
                key={page.id}
                disablePadding
                selected={isPageSelected}
                onClick={() => handlePageClick(page)}
              >
                <ListItemButton sx={{ pl: 7, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Description fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={page.title} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>
            )
          })}
          {authStore.canAdd && (
            <ListItem disablePadding>
              <ListItemButton sx={{ pl: 7, py: 0.5 }} onClick={handleAddPage}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Add fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Добавить страницу" primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Collapse>

      {authStore.canEdit && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          {authStore.canAdd && (
            <MenuItem onClick={handleAddPage}>
              <Add fontSize="small" sx={{ mr: 1 }} />
              Добавить страницу
            </MenuItem>
          )}
          <MenuItem onClick={handleEditSubsection}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Редактировать подраздел
          </MenuItem>
          <MenuItem onClick={handleDeleteSubsection}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Удалить подраздел
          </MenuItem>
        </Menu>
      )}

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        sx={{ '& .MuiDialog-paper': { width: '100%', maxWidth: '500px' } }}
      >
        <DialogTitle>Редактировать подраздел</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название подраздела"
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
        <DialogTitle>Удалить подраздел?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить подраздел "{subsection.title}"? Все
            страницы в этом подразделе также будут удалены.
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
        sx={{ '& .MuiDialog-paper': { width: '100%', maxWidth: '500px' } }}
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
              if (e.key === 'Enter' && newPageTitle.trim()) handleCreatePage()
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

const SectionItem = observer(({ section, onClose }) => {
  const { cookbookStore, authStore } = useStores()
  const [expanded, setExpanded] = useState(
    () => cookbookStore.selectedSectionId === section.id
  )
  const [menuAnchor, setMenuAnchor] = useState(null)

  useEffect(() => {
    if (cookbookStore.selectedSectionId === section.id) {
      setExpanded(true)
    }
  }, [cookbookStore.selectedSectionId, section.id])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(section.title)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addSubsectionDialogOpen, setAddSubsectionDialogOpen] = useState(false)
  const [newSubsectionTitle, setNewSubsectionTitle] = useState('')

  const isSelected = cookbookStore.selectedSectionId === section.id

  const handleClick = (e) => {
    if (!e.target.closest('.MuiIconButton-root')) {
      const nextExpanded = !expanded
      setExpanded(nextExpanded)
      if (nextExpanded && (!section.subsections || section.subsections.length === 0)) {
        cookbookStore.loadSectionSubsections(section.id)
      }
    }
  }

  const handleMenuOpen = (e) => {
    e.stopPropagation()
    setMenuAnchor(e.currentTarget)
  }

  const handleMenuClose = () => setMenuAnchor(null)

  const handleAddSubsection = () => {
    handleMenuClose()
    setNewSubsectionTitle('')
    setAddSubsectionDialogOpen(true)
  }

  const handleCreateSubsection = async () => {
    if (newSubsectionTitle.trim()) {
      try {
        await cookbookStore.addSubsection(section.id, newSubsectionTitle.trim())
        setAddSubsectionDialogOpen(false)
        setNewSubsectionTitle('')
      } catch (error) {
        alert('Ошибка создания подраздела: ' + (error.message || 'Неизвестная ошибка'))
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

  const subsections = section.subsections || []

  return (
    <>
      <StyledListItem
        disablePadding
        selected={isSelected}
        secondaryAction={
          authStore.canEdit && (
            <IconButton edge="end" size="small" onClick={handleMenuOpen}>
              <MoreVert fontSize="small" />
            </IconButton>
          )
        }
      >
        <ListItemButton
          onClick={handleClick}
          sx={{ pl: 1.5, py: 0.5, width: '100%', cursor: 'pointer' }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemIcon>
          <ListItemText primary={section.title} sx={{ flex: 1 }} />
        </ListItemButton>
      </StyledListItem>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {subsections.map((subsection) => (
            <SubsectionItem
              key={subsection.id}
              section={section}
              subsection={subsection}
              onClose={onClose}
            />
          ))}
          {authStore.canAdd && (
            <ListItem disablePadding>
              <ListItemButton sx={{ pl: 3.5, py: 0.5 }} onClick={handleAddSubsection}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Add fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Добавить подраздел" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Collapse>

      {authStore.canEdit && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          {authStore.canAdd && (
            <MenuItem onClick={handleAddSubsection}>
              <Add fontSize="small" sx={{ mr: 1 }} />
              Добавить подраздел
            </MenuItem>
          )}
          <MenuItem onClick={handleEditSection}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Редактировать раздел
          </MenuItem>
          <MenuItem onClick={handleDeleteSection}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Удалить раздел
          </MenuItem>
        </Menu>
      )}

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        sx={{ '& .MuiDialog-paper': { width: '100%', maxWidth: '500px' } }}
      >
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
            Вы уверены, что хотите удалить раздел "{section.title}"? Все
            подразделы и страницы в этом разделе также будут удалены.
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
        open={addSubsectionDialogOpen}
        onClose={() => setAddSubsectionDialogOpen(false)}
        maxWidth="sm"
        sx={{ '& .MuiDialog-paper': { width: '100%', maxWidth: '500px' } }}
      >
        <DialogTitle>Добавить подраздел</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название подраздела"
            fullWidth
            variant="outlined"
            value={newSubsectionTitle}
            onChange={(e) => setNewSubsectionTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newSubsectionTitle.trim()) {
                handleCreateSubsection()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSubsectionDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleCreateSubsection}
            variant="contained"
            disabled={!newSubsectionTitle.trim()}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
})

const Sidebar = observer(({ onClose }) => {
  const { cookbookStore, authStore } = useStores()
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
      {authStore.canAdd && (
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
      )}

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

