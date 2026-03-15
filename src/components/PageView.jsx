import React, { useRef, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../hooks/useStores'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  tablePlugin,
  toolbarPlugin,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  linkPlugin,
  linkDialogPlugin,
  CreateLink,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  Separator,
  useCodeBlockEditorContext,
  insertCodeBlock$,
  usePublisher,
  readOnly$,
} from '@mdxeditor/editor'
import { useCellValues } from '@mdxeditor/gurx'
import '@mdxeditor/editor/style.css'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import MermaidDiagram from './MermaidDiagram'
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
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

const CODE_BLOCK_LANGUAGES = {
  '': 'Без подсветки',
  javascript: 'JavaScript',
  bash: 'Bash',
  java: 'Java',
  mermaid: 'Mermaid',
}

const MermaidBlockEditor = ({ code }) => {
  const { setCode } = useCodeBlockEditorContext()
  const [readOnly] = useCellValues(readOnly$)
  return (
    <Box sx={{ p: 1 }}>
      {!readOnly && (
        <Box
          component="textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          placeholder={'graph TD\n    A --> B\n    B --> C'}
          sx={{
            width: '100%',
            minHeight: 120,
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            resize: 'vertical',
            boxSizing: 'border-box',
            display: 'block',
            mb: 1,
            outline: 'none',
            '&:focus': { borderColor: 'primary.main' },
          }}
        />
      )}
      <MermaidDiagram code={code} />
    </Box>
  )
}

const mermaidDescriptor = {
  priority: 100,
  match: (language) => language === 'mermaid',
  Editor: MermaidBlockEditor,
}

const InsertMermaidDiagram = () => {
  const insertCodeBlock = usePublisher(insertCodeBlock$)
  return (
    <Tooltip title="Вставить диаграмму Mermaid">
      <IconButton
        size="small"
        onClick={() => insertCodeBlock({ language: 'mermaid', code: 'graph TD\n    A --> B' })}
      >
        <AccountTreeIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}

const editorPlugins = (diffMarkdown) => [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  linkPlugin(),
  linkDialogPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript', codeBlockEditorDescriptors: [mermaidDescriptor] }),
  codeMirrorPlugin({ codeBlockLanguages: CODE_BLOCK_LANGUAGES, autoLoadLanguageSupport: true }),
  tablePlugin(),
  markdownShortcutPlugin(),
  diffSourcePlugin({ diffMarkdown, viewMode: 'rich-text' }),
  toolbarPlugin({
    toolbarContents: () => (
      <DiffSourceToggleWrapper>
        <ConditionalContents
          options={[
            {
              when: (editor) => editor?.editorType === 'codeblock',
              contents: () => <ChangeCodeMirrorLanguage />,
            },
            {
              fallback: () => (
                <>
                  <UndoRedo />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <Separator />
                  <BlockTypeSelect />
                  <Separator />
                  <ListsToggle />
                  <Separator />
                  <CreateLink />
                  <InsertTable />
                  <InsertThematicBreak />
                  <InsertCodeBlock />
                  <InsertMermaidDiagram />
                </>
              ),
            },
          ]}
        />
      </DiffSourceToggleWrapper>
    ),
  }),
]

const viewPlugins = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  linkPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript', codeBlockEditorDescriptors: [mermaidDescriptor] }),
  codeMirrorPlugin({ codeBlockLanguages: CODE_BLOCK_LANGUAGES, autoLoadLanguageSupport: true }),
  tablePlugin(),
]

const PageView = observer(() => {
  const { cookbookStore, authStore } = useStores()
  const editorRef = useRef(null)
  const viewContainerRef = useRef(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalContent, setOriginalContent] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')

  const page = cookbookStore.getSelectedPage()
  const section = cookbookStore.getSelectedSection()
  const subsection = cookbookStore.getSelectedSubsection()

  useEffect(() => {
    if (page) {
      setEditedTitle(page.title)
      setIsEditingTitle(false)
    }
  }, [page?.id])

  useEffect(() => {
    if (isEditMode || !page?.content) return

    const container = viewContainerRef.current
    if (!container) return

    const applyHeadingIds = () => {
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach((heading) => {
        const id = heading.textContent
          .toLowerCase()
          .trim()
          .replace(/[^\wа-яёА-ЯЁ\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
        heading.id = id
      })
    }

    const observer = new MutationObserver(applyHeadingIds)
    observer.observe(container, { childList: true, subtree: true })
    applyHeadingIds()

    const handleClick = (e) => {
      const link = e.target.closest('a')
      if (!link) return
      const href = link.getAttribute('href')
      if (href && href.startsWith('#')) {
        e.preventDefault()
        const target = document.getElementById(href.slice(1))
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }

    container.addEventListener('click', handleClick)

    return () => {
      observer.disconnect()
      container.removeEventListener('click', handleClick)
    }
  }, [page?.id, isEditMode])

  useEffect(() => {
    setIsEditMode(false)
  }, [page?.id])

  const handleEnableEditMode = () => {
    const content = typeof page.content === 'string' ? page.content : ''
    setOriginalContent(content)
    setIsEditMode(true)
  }

  const handleSaveAndExit = async () => {
    try {
      const markdown = editorRef.current?.getMarkdown() ?? ''
      await cookbookStore.updatePage(section.id, subsection.id, page.id, {
        content: markdown,
      })
      setIsEditMode(false)
    } catch (error) {
      console.error('Error saving editor content:', error)
      alert('Ошибка сохранения страницы: ' + (error.message || 'Неизвестная ошибка'))
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
        await cookbookStore.updatePage(section.id, subsection.id, page.id, {
          title: editedTitle.trim(),
        })
        setIsEditingTitle(false)
      } catch (error) {
        console.error('Error saving page title:', error)
        alert('Ошибка сохранения названия страницы: ' + (error.message || 'Неизвестная ошибка'))
        setEditedTitle(page.title)
      }
    } else {
      setIsEditingTitle(false)
      setEditedTitle(page.title)
    }
  }

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false)
    setEditedTitle(page.title)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await cookbookStore.deletePage(section.id, subsection.id, page.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      alert('Ошибка удаления страницы: ' + (error.message || 'Неизвестная ошибка'))
      setDeleteDialogOpen(false)
    }
  }

  if (!page || !section || !subsection) {
    return null
  }

  const content = typeof page.content === 'string' ? page.content : ''

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ mb: 0 }}>
        {isEditingTitle && authStore.canEdit ? (
          <TextField
            fullWidth
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle()
              else if (e.key === 'Escape') handleCancelEditTitle()
            }}
            autoFocus
            variant="standard"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleSaveTitle} sx={{ color: 'primary.main' }}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={handleCancelEditTitle} sx={{ color: 'text.secondary' }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiInputBase-root': { fontSize: '1.5rem', fontWeight: 500 } }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: 0,
              cursor: authStore.canEdit ? 'pointer' : 'default',
              '&:hover': authStore.canEdit ? { '& .edit-title-icon': { opacity: 1 } } : {},
            }}
            onClick={authStore.canEdit ? handleStartEditTitle : undefined}
          >
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 500, flexGrow: 1, minWidth: 0, wordBreak: 'break-word', overflowWrap: 'break-word' }}
            >
              {page.title}
            </Typography>
            {authStore.canEdit && (
              <Tooltip title="Редактировать название">
                <IconButton
                  size="small"
                  className="edit-title-icon"
                  sx={{ opacity: 0, transition: 'opacity 0.2s', color: 'primary.main' }}
                >
                  <TitleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      <Box>
        {authStore.canEdit && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
            {isEditMode ? (
              <>
                <Tooltip title="Сохранить">
                  <IconButton size="small" onClick={handleSaveAndExit} sx={{ color: 'primary.main' }}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Отмена">
                  <IconButton size="small" onClick={handleCancelEdit} sx={{ color: 'text.primary' }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Редактировать содержимое">
                  <IconButton size="small" onClick={handleEnableEditMode} sx={{ color: 'primary.main' }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton size="small" onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        )}

        {isEditMode ? (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              '& .mdxeditor': { minHeight: '400px' },
              '& .mdxeditor-toolbar': { borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap' },
            }}
          >
            <MDXEditor
              key={page.id}
              ref={editorRef}
              markdown={content}
              plugins={editorPlugins(originalContent)}
            />
          </Box>
        ) : (
          <Box
            ref={viewContainerRef}
            sx={{
              minWidth: 0,
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              '& .mdxeditor': { padding: 0 },
              '& .mdxeditor-root-contenteditable': { padding: 0 },
              '& [class*="_codeMirrorToolbar"]': { display: 'none' },
            }}
          >
            {content ? (
              <MDXEditor
                key={`view-${page.id}`}
                markdown={content}
                readOnly
                plugins={viewPlugins}
              />
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Страница пуста. Нажмите "Редактировать" для добавления содержимого.
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить страницу?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить страницу "{page.title}"? Это действие нельзя отменить.
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
