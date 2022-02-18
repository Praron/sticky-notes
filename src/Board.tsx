import { MouseEvent, useState, useEffect, useRef, forwardRef } from 'react'
import { Vector, ResizeDirection, getBoundingBox, getRandomColor, vecAdd, vecSub } from './utils'
import Note, { NoteState, minNoteSize } from './Note'


type WireframeProps = {
  // `start` and `end` are diagonal points of rectangle.
  start: Vector,
  end: Vector,
}

const Wireframe = ({ start, end }: WireframeProps) => {
  const { position, dimension } = getBoundingBox(start, end)
  const bigEnough = dimension.x >= minNoteSize && dimension.y >= minNoteSize
  return (
    <div
      className="wireframe"
      style={{
        width: dimension.x,
        height: dimension.y,
        transform: `translate(${position.x}px, ${position.y}px)`,
        borderColor: `var(--dracula-${ bigEnough ? 'fg' : 'comment'})`
      }}
  />)
}


type TrashBinProps = { show: boolean }

const TrashBin = forwardRef(({ show }: TrashBinProps, ref: any) =>
  <div ref={ ref } className={ `trash-bin ${show ? 'show' : ''}` }><div className="trash-icon">✕</div></div>
)


export type NoteId = string

type ActionNone = {
  type: 'none'
}
const actionNone: ActionNone = { type: 'none' }

type ActionCreate = {
  type: 'create',
} & WireframeProps

// Note is clicked but not draged.
type ActionHold = {
  type: 'hold',
  id: NoteId,
}

type ActionMove = {
  type: 'move',
  id: NoteId,
  mousePosition: Vector,
}

type ActionResize = {
  type: 'resize',
  id: NoteId,
  mousePosition: Vector,
  direction: ResizeDirection,
}

type Action =
  | ActionNone
  | ActionCreate
  | ActionHold
  | ActionMove
  | ActionResize


function* generateId(initial = 0) {
  let i = initial
  while (true) {
    yield String(i)
    i++
  }
}

const getInitialIdGenerator = (): Generator<string, void> => {
  const initial = Math.max(...Object.keys(getInitialNotes()).map(id => Number(id))) + 1
  return generateId(Number.isInteger(initial) ? initial : 0)
}

const getInitialNotes = (): Record<NoteId, NoteState> => {
  const serialized = localStorage.getItem('notes')
  return serialized ? JSON.parse(serialized) : {}
}

const storeNotes = (notes: Record<NoteId, NoteState>) => {
  localStorage.setItem('notes', JSON.stringify(notes))
}

const Board = () => {
  const [notes, setNotes] = useState(getInitialNotes)
  const [action, setAction] = useState(actionNone as Action)
  const [idGenerator] = useState(getInitialIdGenerator)
  const boardRef = useRef(null as HTMLDivElement | null)
  const trashRef = useRef(null as HTMLDivElement | null)

  useEffect(() => storeNotes(notes), [notes])

  const nextId = () => idGenerator.next().value!

  const eventToVector = (event: MouseEvent<HTMLDivElement>): Vector => {
    const rect = boardRef.current!.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return { x, y }
  }

  const startNoteCreation = (event: MouseEvent<HTMLDivElement>) => {
    const start = eventToVector(event)
    const end = { ...start }
    setAction({ type: 'create', start, end })
  }

  const startNoteHolding = (event: MouseEvent<HTMLDivElement>, id: NoteId) => {
    event.stopPropagation()

    setAction({ type: 'hold', id })
  }

  const startNoteResizing = (event: MouseEvent<HTMLDivElement>, id: NoteId, direction: ResizeDirection) => {
    event.stopPropagation()

    const mousePosition = eventToVector(event)
    setAction({ type: 'resize', id, direction, mousePosition })
  }

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    switch (action.type) {
      case 'create': {
        const end = eventToVector(event)
        setAction(prev => prev.type === 'create' ? { ...prev, end } : actionNone)
        break
      }

      case 'hold': {
        const { id } = action
        const mousePosition = eventToVector(event)
        setAction(prev => prev.type === 'hold' ? { type: 'move', id, mousePosition } : { ...prev })
        break
      }

      case 'move': {
        const { id } = action
        const mousePosition = eventToVector(event)
        const delta = vecSub(mousePosition, action.mousePosition)
        const position = vecAdd(notes[id].position, delta)
        setAction(prev => prev.type === 'move' ? { ...prev, mousePosition } : { ...prev })
        setNotes(prev => ({ ...prev, [id]: { ...prev[id], position } }))
        break
      }

      case 'resize': {
        const { id } = action
        const { position: oldPosition, dimension: oldDimension } = notes[id]
        const mousePosition = eventToVector(event)
        const delta = vecSub(mousePosition, action.mousePosition)
        let position: Vector
        let dimension: Vector
        switch (action.direction) {
          case 'top-left':
            position = vecAdd(oldPosition, delta)
            dimension = vecSub(oldDimension, delta)
            break
          case 'top-right':
            position = { x: oldPosition.x, y: oldPosition.y + delta.y }
            dimension = { x: oldDimension.x + delta.x, y: oldDimension.y - delta.y }
            break
          case 'bottom-left':
            position = { x: oldPosition.x + delta.x, y: oldPosition.y }
            dimension = { x: oldDimension.x - delta.x, y: oldDimension.y + delta.y }
            break
          case 'bottom-right':
            position = { ...oldPosition }
            dimension = vecAdd(oldDimension, delta)
            break
        }

        // Without this check, resizing to small size leads to unwanted moving of note in some cases.
        if (dimension.x < minNoteSize || dimension.y < minNoteSize) {
          position = { ...oldPosition }
          dimension = { ...oldDimension }
        } else {
          dimension = { x: Math.max(dimension.x, minNoteSize), y: Math.max(dimension.y, minNoteSize) }
        }

        setAction(prev => prev.type === 'resize' ? { ...prev, mousePosition } : { ...prev })
        setNotes(prev => ({ ...prev, [id]: { ...prev[id], position, dimension } }))
        break
      }
    }
  }

  const handleMouseUp = () => {
    switch (action.type) {
      case 'create': {
        const { position, dimension } = getBoundingBox(action.start, action.end)

        if (dimension.x > minNoteSize && dimension.y > minNoteSize) {
          const id = nextId()
          const color = getRandomColor()
          setNotes(prev => ({ ...prev, [id]: { position, dimension, id, color } }))
        }

        break
      }

      case 'hold': {
        const { id } = action
        setNotes(prev => ({ ...prev, [id]: { ...prev[id], color: getRandomColor(prev[id].color) } }))
        break
      }

      case 'move': {
        const { id } = action

        const { position, dimension } = notes[id]
        const trashBin = trashRef.current?.getBoundingClientRect()

        const collided = trashBin &&
          position.x < trashBin.right &&
          position.x + dimension.x > trashBin.x &&
          position.y < trashBin.bottom &&
          position.y + dimension.y > trashBin.y

        if (collided) {
          // Remove note if it's collided with trash bin.
          setNotes(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id)))
        }

        break
      }
    }

    setAction(actionNone)
  }

  return (
    <div
      ref={ boardRef }
      className="board"
      onMouseDown={ startNoteCreation }
      onMouseMove={ handleMouseMove }
      onMouseUp={ handleMouseUp }
      onMouseLeave= { handleMouseUp }
    >
      <TrashBin ref={ trashRef } show={ action.type === 'move' } />

      { Object.entries(notes).map(([id, note]) => {
          const isMoving = action.type === 'move' && id === action.id
          return <Note
            key={ id }
            { ...note }
            isMoving={ isMoving }
            onNoteMouseDown={ (e) => startNoteHolding(e, id) }
            onHandleMouseDown={ (e, dir) => startNoteResizing(e, id, dir) }
          />
        })
      }

      { action.type === 'create' ? <Wireframe { ...action } /> : null }

      <div
        className="empty-board-message"
        style={{ opacity: Object.keys(notes).length === 0 && action.type === 'none' ? '100%' : '0' }}
      >
        Draw a rectangle
      </div>
    </div>
  )
}

export default Board
