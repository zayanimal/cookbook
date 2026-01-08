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

  // Поиск по всем страницам
  const performSearch = useMemo(() => {
    return (query) => {
      if (!query || query.trim().length < 2) {
        return []
      }

      const lowerQuery = query.toLowerCase().trim()
      const results = []

      // Проходим по всем разделам и страницам
      cookbookStore.sections.forEach((section) => {
        // Поиск в названии раздела
        const sectionTitleMatch = section.title?.toLowerCase().includes(lowerQuery)

        if (!section.pages || section.pages.length === 0) {
          // Если раздел без страниц, но название совпадает, добавляем раздел
          if (sectionTitleMatch) {
            results.push({
              sectionId: section.id,
              sectionTitle: section.title,
              pageId: null,
              pageTitle: null,
              snippet: section.title,
              matchType: 'section',
            })
          }
          return
        }

        section.pages.forEach((page) => {
          // Поиск в названии страницы
          const pageTitleMatch = page.title?.toLowerCase().includes(lowerQuery)
          
          // Поиск в содержимом страницы
          const contentText = extractTextFromBlocks(page.content?.blocks)
          const contentMatch = contentText.toLowerCase().includes(lowerQuery)

          if (pageTitleMatch || contentMatch || sectionTitleMatch) {
            // Находим позицию совпадения в тексте
            const contentIndex = contentText.toLowerCase().indexOf(lowerQuery)

            // Формируем сниппет (фрагмент текста с совпадением)
            let snippet = ''
            if (pageTitleMatch) {
              snippet = page.title
            } else if (contentMatch) {
              const start = Math.max(0, contentIndex - 50)
              const end = Math.min(contentText.length, contentIndex + lowerQuery.length + 50)
              snippet = '...' + contentText.substring(start, end) + '...'
            } else if (sectionTitleMatch) {
              snippet = section.title
            }

            results.push({
              sectionId: section.id,
              sectionTitle: section.title,
              pageId: page.id,
              pageTitle: page.title,
              snippet,
              matchType: pageTitleMatch ? 'title' : contentMatch ? 'content' : 'section',
            })
          }
        })
      })

      // Сортируем результаты: сначала совпадения в названии страницы, потом в содержимом, потом в разделе
      return results.sort((a, b) => {
        const priority = { title: 1, content: 2, section: 3 }
        return (priority[a.matchType] || 3) - (priority[b.matchType] || 3)
      })
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

  // Загружаем страницы для всех разделов при открытии диалога
  useEffect(() => {
    if (open) {
      // Загружаем страницы для разделов, у которых они еще не загружены
      const loadPages = async () => {
        for (const section of cookbookStore.sections) {
          if (!section.pages || section.pages.length === 0) {
            await cookbookStore.loadSectionPages(section.id)
          }
        }
      }
      loadPages()
    }
  }, [open, cookbookStore])

  const handleResultClick = (sectionId, pageId) => {
    cookbookStore.selectSection(sectionId)
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
              <React.Fragment key={`${result.sectionId}-${result.pageId}`}>
                {index > 0 && <Divider component="li" />}
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleResultClick(result.sectionId, result.pageId)}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 2 }}>
                      <Box sx={{ mt: 0.5 }}>
                        {result.matchType === 'section' ? (
                          <FolderIcon color="primary" />
                        ) : (
                          <DescriptionIcon color={result.matchType === 'title' ? 'primary' : 'action'} />
                        )}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: result.matchType === 'title' || result.matchType === 'section' ? 600 : 400,
                            mb: 0.5,
                          }}
                        >
                          {result.pageTitle || result.sectionTitle}
                        </Typography>
                        {result.pageTitle && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {result.sectionTitle}
                          </Typography>
                        )}
                        {result.snippet && result.matchType !== 'title' && result.matchType !== 'section' && (
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

