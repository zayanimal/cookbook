import React, { useEffect, useState, useRef } from 'react'
import mermaid from 'mermaid'
import { Box, Typography } from '@mui/material'

mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' })

let counter = 0

const MermaidDiagram = ({ code }) => {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(null)
  const idRef = useRef(`mermaid-${++counter}`)

  useEffect(() => {
    if (!code?.trim()) {
      setSvg('')
      setError(null)
      return
    }

    const id = `mermaid-${++counter}`
    idRef.current = id

    mermaid
      .render(id, code.trim())
      .then(({ svg: rendered }) => {
        setSvg(rendered)
        setError(null)
      })
      .catch((err) => {
        setError(err.message || 'Ошибка в синтаксисе диаграммы')
        setSvg('')
      })
  }, [code])

  if (!code?.trim()) return null

  if (error) {
    return (
      <Box sx={{ p: 1, border: '1px solid', borderColor: 'error.light', borderRadius: 1, bgcolor: 'error.50' }}>
        <Typography variant="caption" color="error.main" sx={{ fontFamily: 'monospace' }}>
          Mermaid: {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', py: 1 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default MermaidDiagram
