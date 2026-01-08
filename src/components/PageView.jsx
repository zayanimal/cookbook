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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Toolbar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import TitleIcon from '@mui/icons-material/Title'
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
  const { cookbookStore, authStore } = useStores()
  const editorRef = useRef(null)
  const editorInstanceRef = useRef(null)
  const [isEditMode, setIsEditMode] = useState(false) // Режим редактирования выключен по умолчанию
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [isHoveringContent, setIsHoveringContent] = useState(false)

  const page = cookbookStore.getSelectedPage()
  const section = cookbookStore.getSelectedSection()

  // Инициализируем editedTitle при изменении страницы
  useEffect(() => {
    if (page) {
      setEditedTitle(page.title)
      setIsEditingTitle(false)
    }
  }, [page?.id])

  // Уничтожаем предыдущий экземпляр редактора
  const cleanup = async () => {
    if (editorInstanceRef.current) {
      try {
        if (typeof editorInstanceRef.current.destroy === 'function') {
          await editorInstanceRef.current.destroy()
        } else if (typeof editorInstanceRef.current.destroy === 'object' && editorInstanceRef.current.destroy.then) {
          await editorInstanceRef.current.destroy().catch(() => {})
        }
      } catch (error) {
        console.warn('Error destroying editor:', error)
      }
      editorInstanceRef.current = null
    }
    if (editorRef.current) {
      editorRef.current.innerHTML = ''
    }
  }

  // Инициализация редактора при включении режима редактирования
  useEffect(() => {
    if (!page || !editorRef.current || !isEditMode) {
      // Если режим редактирования выключен - очищаем редактор
      if (!isEditMode) {
        cleanup()
      }
      return
    }

    let isMounted = true

    const initEditor = async () => {
      await cleanup()
      await new Promise((resolve) => setTimeout(resolve, 100))

      if (!isMounted || !editorRef.current || !page) return

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
            image: {
              class: Image,
              config: {
                endpoints: {
                  byFile: '/api/image',
                },
                uploader: {
                  async uploadByFile(file) {
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
          autofocus: true,
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
  }, [page?.id, isEditMode])

  // Сбрасываем режим редактирования при смене страницы
  useEffect(() => {
    setIsEditMode(false)
  }, [page?.id])

  const handleEnableEditMode = () => {
    setIsEditMode(true)
  }

  const handleSaveAndExit = async () => {
    if (editorInstanceRef.current) {
      try {
        const outputData = await editorInstanceRef.current.save()
        await cookbookStore.updatePage(section.id, page.id, {
          content: outputData,
        })
        setIsEditMode(false)
      } catch (error) {
        console.error('Error saving editor content:', error)
        alert('Ошибка сохранения страницы: ' + (error.message || 'Неизвестная ошибка'))
      }
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
  }

  const handleStartEditTitle = () => {
    setEditedTitle(page.title)
    setIsEditingTitle(true)
  }

  const handleSaveTitle = async () => {
    if (editedTitle.trim() && editedTitle.trim() !== page.title) {
      try {
        await cookbookStore.updatePage(section.id, page.id, {
          title: editedTitle.trim(),
        })
        setIsEditingTitle(false)
      } catch (error) {
        console.error('Error saving page title:', error)
        alert('Ошибка сохранения названия страницы: ' + (error.message || 'Неизвестная ошибка'))
        setEditedTitle(page.title) // Восстанавливаем исходное значение
      }
    } else {
      setIsEditingTitle(false)
      setEditedTitle(page.title) // Восстанавливаем исходное значение
    }
  }

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false)
    setEditedTitle(page.title) // Восстанавливаем исходное значение
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

  // Рендеринг контента в режиме просмотра
  const renderContent = () => {
    if (!page.content || !page.content.blocks || page.content.blocks.length === 0) {
      return (
        <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Страница пуста. Нажмите "Редактировать" для добавления содержимого.
        </Typography>
      )
    }

    return page.content.blocks.map((block, index) => {
      switch (block.type) {
        case 'header':
          const HeaderTag = `h${block.data.level || 2}`
          return (
            <Typography
              key={index}
              variant={`h${block.data.level + 2 || 4}`}
              component={HeaderTag}
              sx={{ mt: index > 0 ? 3 : 0, mb: 2 }}
            >
              {block.data.text}
            </Typography>
          )
        case 'paragraph':
          return (
            <Typography
              key={index}
              variant="body1"
              sx={{ mb: 2 }}
              dangerouslySetInnerHTML={{ __html: block.data.text }}
            />
          )
        case 'list':
          const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul'
          return (
            <Box key={index} component={ListTag} sx={{ mb: 2, pl: 3 }}>
              {block.data.items.map((item, itemIndex) => (
                <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </Box>
          )
        case 'code':
          return (
            <Box
              key={index}
              component="pre"
              sx={{
                backgroundColor: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                mb: 2,
                fontFamily: 'monospace',
              }}
            >
              <code>{block.data.code}</code>
            </Box>
          )
        case 'quote':
          return (
            <Box
              key={index}
              sx={{
                borderLeft: 4,
                borderColor: 'primary.main',
                pl: 2,
                py: 1,
                mb: 2,
                fontStyle: 'italic',
              }}
            >
              <Typography variant="body1">{block.data.text}</Typography>
              {block.data.caption && (
                <Typography variant="caption" color="text.secondary">
                  — {block.data.caption}
                </Typography>
              )}
            </Box>
          )
        case 'image':
          return (
            <Box key={index} sx={{ mb: 2, textAlign: 'center' }}>
              <img
                src={block.data.file?.url}
                alt={block.data.caption || ''}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              {block.data.caption && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {block.data.caption}
                </Typography>
              )}
            </Box>
          )
        case 'table':
          return (
            <Box key={index} sx={{ mb: 2, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {block.data.content.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          style={{
                            border: '1px solid #ddd',
                            padding: '8px',
                          }}
                          dangerouslySetInnerHTML={{ __html: cell }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )
        default:
          return null
      }
    })
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Заголовок страницы с возможностью редактирования */}
      <Box sx={{ mb: 1 }}>
        {isEditingTitle && authStore.canEdit ? (
          <TextField
            fullWidth
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveTitle()
              } else if (e.key === 'Escape') {
                handleCancelEditTitle()
              }
            }}
            autoFocus
            variant="standard"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleSaveTitle}
                    sx={{ color: 'primary.main' }}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleCancelEditTitle}
                    sx={{ color: 'text.secondary' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '2rem',
                fontWeight: 500,
              },
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: authStore.canEdit ? 'pointer' : 'default',
              '&:hover': authStore.canEdit
                ? {
                    '& .edit-title-icon': {
                      opacity: 1,
                    },
                }
                : {},
            }}
            onClick={authStore.canEdit ? handleStartEditTitle : undefined}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 500,
                flexGrow: 1,
                wordBreak: 'break-word',
              }}
            >
              {page.title}
            </Typography>
            {authStore.canEdit && (
              <Tooltip title="Редактировать название">
                <IconButton
                  size="small"
                  className="edit-title-icon"
                  sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    color: 'primary.main',
                  }}
                >
                  <TitleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      <Toolbar
        sx={{
          px: 0,
          py: 0,
          minHeight: '32px !important',
          height: '32px',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 1,
          opacity: isEditMode || isHoveringContent ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={() => setIsHoveringContent(true)}
        onMouseLeave={() => setIsHoveringContent(false)}
      >
        <Box sx={{ flexGrow: 1, minWidth: 200 }}></Box>
        {authStore.canEdit && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isEditMode ? (
              <>
                <Tooltip title="Сохранить">
                  <IconButton
                    size="small"
                    onClick={handleSaveAndExit}
                    sx={{
                      color: 'primary.main',
                    }}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Отмена">
                  <IconButton
                    size="small"
                    onClick={handleCancelEdit}
                    sx={{
                      color: 'text.primary',
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Редактировать содержимое">
                  <IconButton
                    size="small"
                    onClick={handleEnableEditMode}
                    sx={{
                      color: 'primary.main',
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton
                    size="small"
                    onClick={handleDelete}
                    sx={{
                      color: 'error.main',
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        )}
      </Toolbar>

      <Box
        sx={{ mt: 0, pt: 0 }}
        onMouseEnter={() => setIsHoveringContent(true)}
        onMouseLeave={() => setIsHoveringContent(false)}
      >
        {isEditMode ? (
          <EditorContainer>
            <div
              ref={editorRef}
              id="editorjs"
              style={{
                minHeight: '400px',
              }}
            />
          </EditorContainer>
        ) : (
          <Box>{renderContent()}</Box>
        )}
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

