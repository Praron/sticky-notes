import { MouseEvent } from 'react'
import { ResizeDirection, Vector, Color, resizeDirections } from './utils'


interface HandleProps {
  direction: ResizeDirection,
  onResizeStart: (event: MouseEvent<HTMLDivElement>, direction: ResizeDirection) => void,
}

const Handle = ({ direction, onResizeStart }: HandleProps) => {
  return (
    <div
      className={`handle ${direction}`}
      onMouseDown={ (e) => onResizeStart(e, direction) }
    />
  )
}


export type NoteId = string

export interface NoteState {
  id: NoteId,
  position: Vector,  // Coordinates of top-left corner of note, in px.
  dimension: Vector,  // Width (`x`) and height (`y`) of note, in px.
  color: Color,
}

export type NoteProps =
  & NoteState
  & {
    isMoving: boolean,
    onMoveStart: (event: MouseEvent<HTMLDivElement>) => void,
    onResizeStart: (event: MouseEvent<HTMLDivElement>, direction: ResizeDirection) => void,
  }

export const minNoteSize = 100

const Note = ({ position, dimension, color, isMoving, onMoveStart, onResizeStart }: NoteProps) => {
  return (
    <div
      className={ `note${isMoving ? ' is-moving': ''}` }
      style={{
        width: dimension.x,
        height: dimension.y,
        backgroundColor: `var(--dracula-${color})`,
        ['--position-x' as any]: `${position.x}px`,
        ['--position-y' as any]: `${position.y}px`,
      }}
      onMouseDown={ onMoveStart }
    >
      { resizeDirections.map(direction =>
          <Handle
            key={ direction }
            direction={ direction }
            onResizeStart={ onResizeStart }
          />
        )
      }
    </div>
  )
}

export default Note
