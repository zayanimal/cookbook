import React, { useState, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../hooks/useStores'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  InputAdornment,
  Divider,
  Paper,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import DescriptionIcon from '@mui/icons-material/Description'
import FolderIcon from '@mui/icons-material/Folder'

/**
 * Компонент поиска по документации
 */
const SearchDialog = observer(({ open, onClose }) => {
  const { cookbookStore } = useStores()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Функция для извлечения текста из блоков EditorJS
  const extractTextFromBlocks = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return ''
    
    return blocks
      .map((block) => {
        switch (block.type) {
          case 'header':
            return block.data?.text || ''
          case 'paragraph':
            return block.data?.text || ''
          case 'list':
            return block.data?.items?.join(' ') || ''
          case 'quote':
            return block.data?.text || ''
          case 'code':
            return block.data?.code || ''
          default:
            return ''
        }
      })
      .join(' ')
      .replace(/<[^>]*>/g, '') // Удаляем HTML теги
  }

  // Поиск по всем разделам, подразделам и страницам
  const performSearch = useMemo(() => {
    return (query) => {
      if (!query || query.trim().length < 2) {
        return []
      }

      const lowerQuery = query.toLowerCase().trim()
      const results = []

      cookbookStore.sections.forEach((section) => {
        const sectionTitleMatch = section.title?.toLowerCase().includes(lowerQuery)
        const subsections = section.subsections || []

        if (subsections.length === 0) {
          if (sectionTitleMatch) {
            results.push({
              sectionId: section.id,
              subsectionId: null,
              sectionTitle: section.title,
              subsectionTitle: null,
              pageId: null,
              pageTitle: null,
              snippet: section.title,
              matchType: 'section',
            })
          }
          return
        }

        subsections.forEach((subsection) => {
          const subsectionTitleMatch = subsection.title?.toLowerCase().includes(lowerQuery)
          const pages = subsection.pages || []

          if (pages.length === 0) {
            if (subsectionTitleMatch || sectionTitleMatch) {
              results.push({
                sectionId: section.id,
                subsectionId: subsection.id,
                sectionTitle: section.title,
                subsectionTitle: subsection.title,
                pageId: null,
                pageTitle: null,
                snippet: subsection.title || section.title,
                matchType: subsectionTitleMatch ? 'subsection' : 'section',
              })
            }
            return
          }

          pages.forEach((page) => {
            const pageTitleMatch = page.title?.toLowerCase().includes(lowerQuery)
            const contentText = extractTextFromBlocks(page.content?.blocks)
            const contentMatch = contentText.toLowerCase().includes(lowerQuery)

            if (pageTitleMatch || contentMatch || subsectionTitleMatch || sectionTitleMatch) {
              const contentIndex = contentText.toLowerCase().indexOf(lowerQuery)
              let snippet = ''
              if (pageTitleMatch) {
                snippet = page.title
              } else if (contentMatch) {
                const start = Math.max(0, contentIndex - 50)
                const end = Math.min(contentText.length, contentIndex + lowerQuery.length + 50)
                snippet = '...' + contentText.substring(start, end) + '...'
              } else if (subsectionTitleMatch) {
                snippet = subsection.title
              } else {
                snippet = section.title
              }

              const matchType = pageTitleMatch
                ? 'title'
                : contentMatch
                  ? 'content'
                  : subsectionTitleMatch
                    ? 'subsection'
                    : 'section'

              results.push({
                sectionId: section.id,
                subsectionId: subsection.id,
                sectionTitle: section.title,
                subsectionTitle: subsection.title,
                pageId: page.id,
                pageTitle: page.title,
                snippet,
                matchType,
              })
            }
          })
        })
      })

      const priority = { title: 1, content: 2, subsection: 3, section: 4 }
      return results.sort((a, b) => (priority[a.matchType] || 4) - (priority[b.matchType] || 4))
    }
  }, [cookbookStore.sections])

  // Выполняем поиск при изменении запроса
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = performSearch(searchQuery)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, performSearch])

  // Загружаем подразделы и страницы при открытии диалога
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        for (const section of cookbookStore.sections) {
          if (!section.subsections || section.subsections.length === 0) {
            await cookbookStore.loadSectionSubsections(section.id)
          }
          const subsections = section.subsections || []
          for (const subsection of subsections) {
            if (!subsection.pages || subsection.pages.length === 0) {
              await cookbookStore.loadSubsectionPages(section.id, subsection.id)
            }
          }
        }
      }
      loadData()
    }
  }, [open, cookbookStore])

  const handleResultClick = (sectionId, subsectionId, pageId) => {
    cookbookStore.selectSection(sectionId)
    if (subsectionId) {
      cookbookStore.selectSubsection(sectionId, subsectionId)
    }
    if (pageId) {
      cookbookStore.selectPage(pageId)
    }
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle>
        <TextField
          fullWidth
          placeholder="Поиск по документации..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mt: 1 }}
        />
      </DialogTitle>
      <DialogContent dividers>
        {searchQuery.trim().length < 2 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Введите минимум 2 символа для поиска
            </Typography>
          </Box>
        ) : searchResults.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Ничего не найдено
            </Typography>
          </Box>
        ) : (
          <List>
            {searchResults.map((result, index) => (
              <React.Fragment
                key={`${result.sectionId}-${result.subsectionId || ''}-${result.pageId || ''}`}
              >
                {index > 0 && <Divider component="li" />}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() =>
                      handleResultClick(
                        result.sectionId,
                        result.subsectionId,
                        result.pageId
                      )
                    }
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 2 }}>
                      <Box sx={{ mt: 0.5 }}>
                        {result.matchType === 'section' ||
                        result.matchType === 'subsection' ? (
                          <FolderIcon color="primary" />
                        ) : (
                          <DescriptionIcon
                            color={
                              result.matchType === 'title' ? 'primary' : 'action'
                            }
                          />
                        )}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight:
                              result.matchType === 'title' ||
                              result.matchType === 'section' ||
                              result.matchType === 'subsection'
                                ? 600
                                : 400,
                            mb: 0.5,
                          }}
                        >
                          {result.pageTitle ||
                            result.subsectionTitle ||
                            result.sectionTitle}
                        </Typography>
                        {(result.pageTitle || result.subsectionTitle) && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {result.subsectionTitle
                              ? `${result.sectionTitle} → ${result.subsectionTitle}`
                              : result.sectionTitle}
                          </Typography>
                        )}
                        {result.snippet &&
                          result.matchType !== 'title' &&
                          result.matchType !== 'section' &&
                          result.matchType !== 'subsection' && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                              noWrap
                            >
                              {result.snippet}
                            </Typography>
                          )}
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
})

export default SearchDialog

