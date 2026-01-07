import React, { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../hooks/useStores'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import Code from '@editorjs/code'
import Quote from '@editorjs/quote'
import Table from '@editorjs/table'
// import LinkTool from '@editorjs/link'
import Image from '@editorjs/image'
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Toolbar,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import styled from '@emotion/styled'

const EditorContainer = styled(Box)(({ theme }) => ({
  '& .codex-editor': {
    fontFamily: theme.typography.fontFamily,
  },
  '& .ce-block__content': {
    maxWidth: '100%',
  },
  '& .ce-toolbar__content': {
    maxWidth: '100%',
  },
  '& .ce-popover': {
    maxWidth: '100%',
  },
  '& .ce-toolbar__plus': {
    left: 'auto',
    right: '0',
  },
  [theme.breakpoints.down('md')]: {
    '& .ce-toolbar': {
      position: 'relative',
    },
    '& .ce-inline-toolbar': {
      maxWidth: 'calc(100vw - 32px)',
    },
  },
}))

const PageView = observer(() => {
  const { cookbookStore } = useStores()
  const editorRef = useRef(null)
  const editorInstanceRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const page = cookbookStore.getSelectedPage()
  const section = cookbookStore.getSelectedSection()

  useEffect(() => {
    if (!page || !editorRef.current) return

    let isMounted = true

    // Уничтожаем предыдущий экземпляр редактора
    const cleanup = async () => {
      if (editorInstanceRef.current) {
        try {
          // Проверяем наличие метода destroy
          if (typeof editorInstanceRef.current.destroy === 'function') {
            await editorInstanceRef.current.destroy()
          } else if (typeof editorInstanceRef.current.destroy === 'object' && editorInstanceRef.current.destroy.then) {
            // Если destroy возвращает Promise
            await editorInstanceRef.current.destroy().catch(() => {})
          }
        } catch (error) {
          console.warn('Error destroying editor:', error)
        }
        editorInstanceRef.current = null
      }
      // Очищаем контейнер
      if (editorRef.current) {
        editorRef.current.innerHTML = ''
      }
    }

    // Создаем новый экземпляр редактора для текущей страницы
    const initEditor = async () => {
      // Сначала полностью очищаем предыдущий экземпляр
      await cleanup()

      // Небольшая задержка для гарантии полной очистки DOM
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Проверяем, что компонент все еще смонтирован и страница не изменилась
      if (!isMounted || !editorRef.current || !page) return

      // Проверяем, что контейнер пуст
      if (editorRef.current.innerHTML.trim() !== '') {
        editorRef.current.innerHTML = ''
      }

      try {
        const editorInstance = new EditorJS({
          holder: editorRef.current,
          tools: {
            header: {
              class: Header,
              config: {
                placeholder: 'Введите заголовок',
                levels: [2, 3, 4],
                defaultLevel: 2,
              },
            },
            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
            },
            list: {
              class: List,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered',
              },
            },
            code: {
              class: Code,
              config: {
                placeholder: 'Введите код',
              },
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
              config: {
                quotePlaceholder: 'Введите цитату',
                captionPlaceholder: 'Автор цитаты',
              },
            },
            table: {
              class: Table,
              inlineToolbar: true,
              config: {
                rows: 2,
                cols: 2,
              },
            },
            // linkTool: {
            //   class: LinkTool,
            //   config: {
            //     endpoint: '/api/link',
            //   },
            // },
            image: {
              class: Image,
              config: {
                endpoints: {
                  byFile: '/api/image',
                },
                uploader: {
                  async uploadByFile(file) {
                    // Простая заглушка для загрузки изображений
                    // В реальном приложении здесь должен быть API endpoint
                    return {
                      success: 1,
                      file: {
                        url: URL.createObjectURL(file),
                      },
                    }
                  },
                },
              },
            },
          },
          data: page.content || { blocks: [] },
          placeholder: 'Начните вводить текст...',
          autofocus: false,
        })
        
        if (isMounted) {
          editorInstanceRef.current = editorInstance
        }
      } catch (error) {
        console.error('Error initializing editor:', error)
      }
    }

    initEditor()

    return () => {
      isMounted = false
      cleanup()
    }
  }, [page?.id])

  useEffect(() => {
    if (page) {
      setEditTitle(page.title)
    }
  }, [page])

  const handleSave = async () => {
    if (editorInstanceRef.current) {
      try {
        const outputData = await editorInstanceRef.current.save()
        await cookbookStore.updatePage(section.id, page.id, {
          content: outputData,
        })
        // Можно показать уведомление об успешном сохранении
      } catch (error) {
        console.error('Error saving editor content:', error)
        alert('Ошибка сохранения страницы: ' + (error.message || 'Неизвестная ошибка'))
      }
    }
  }

  const handleEditTitle = () => {
    setIsEditing(true)
  }

  const handleSaveTitle = async () => {
    if (editTitle.trim()) {
      try {
        await cookbookStore.updatePage(section.id, page.id, {
          title: editTitle.trim(),
        })
        setIsEditing(false)
      } catch (error) {
        alert('Ошибка обновления названия: ' + (error.message || 'Неизвестная ошибка'))
      }
    }
  }

  const handleCancelEdit = () => {
    setEditTitle(page.title)
    setIsEditing(false)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await cookbookStore.deletePage(section.id, page.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      alert('Ошибка удаления страницы: ' + (error.message || 'Неизвестная ошибка'))
      setDeleteDialogOpen(false)
    }
  }

  if (!page || !section) {
    return null
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Toolbar
        sx={{
          px: 0,
          minHeight: 'auto',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 200 }}>
          {isEditing ? (
            <TextField
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveTitle()
                } else if (e.key === 'Escape') {
                  handleCancelEdit()
                }
              }}
              autoFocus
              fullWidth
              variant="standard"
              sx={{ fontSize: '1.5rem' }}
            />
          ) : (
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.7,
                },
              }}
              onClick={handleEditTitle}
            >
              {page.title}
            </Typography>
          )}
          {isEditing && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveTitle}
              >
                Сохранить
              </Button>
              <Button size="small" onClick={handleCancelEdit}>
                Отмена
              </Button>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="primary"
            onClick={handleSave}
            title="Сохранить изменения"
          >
            <SaveIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={handleEditTitle}
            title="Редактировать название"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={handleDelete}
            title="Удалить страницу"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Toolbar>

      <Box sx={{ mt: 4 }}>
        <EditorContainer>
          <div
            ref={editorRef}
            id="editorjs"
            style={{
              minHeight: '400px',
            }}
          />
        </EditorContainer>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить страницу?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить страницу "{page.title}"? Это действие
            нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
})

export default PageView

