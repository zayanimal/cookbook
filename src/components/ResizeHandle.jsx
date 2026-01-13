import React, { useRef, useEffect, useState } from 'react'
import { Box } from '@mui/material'
import styled from '@emotion/styled'

const ResizeHandleBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '4px',
  height: '100%',
  cursor: 'col-resize',
  backgroundColor: 'transparent',
  zIndex: 1,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    opacity: 0.5,
  },
  '&:active': {
    backgroundColor: theme.palette.primary.main,
    opacity: 0.8,
  },
}))

const ResizeHandle = ({ onResize, onResizeStart, onResizeEnd, minWidth = 200, maxWidth = 600 }) => {
  const [isResizing, setIsResizing] = useState(false)
  const handleRef = useRef(null)

  useEffect(() => {
    const handleMouseDown = (e) => {
      e.preventDefault()
      setIsResizing(true)
      if (onResizeStart) onResizeStart()
    }

    const handleRefCurrent = handleRef.current
    if (handleRefCurrent) {
      handleRefCurrent.addEventListener('mousedown', handleMouseDown)
    }

    return () => {
      if (handleRefCurrent) {
        handleRefCurrent.removeEventListener('mousedown', handleMouseDown)
      }
    }
  }, [onResizeStart])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e) => {
      const newWidth = e.clientX
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      onResize(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      if (onResizeEnd) onResizeEnd()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Отключаем выделение текста во время перетаскивания
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isResizing, onResize, onResizeEnd, minWidth, maxWidth])

  return <ResizeHandleBox ref={handleRef} />
}

export default ResizeHandle
