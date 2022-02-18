import { MouseEvent } from 'react'
import { ResizeDirection, Vector, Color, resizeDirections } from './utils'


interface HandleProps {
  direction: ResizeDirection,
  onMouseDown: (event: MouseEvent<HTMLDivElement>, direction: ResizeDirection) => void,
}

const Handle = ({ direction, onMouseDown }: HandleProps) => {
  return (
    <div
      className={`handle ${direction}`}
      onMouseDown={ (e) => onMouseDown(e, direction) }
    />
  )
}


export interface NoteState {
  position: Vector,  // Coordinates of top-left corner of note, in px.
  dimension: Vector,  // Width (`x`) and height (`y`) of note, in px.
  color: Color,
}

export type NoteProps =
  & NoteState
  & {
    isMoving: boolean,
    onNoteMouseDown: (event: MouseEvent<HTMLDivElement>) => void,
    onHandleMouseDown: (event: MouseEvent<HTMLDivElement>, direction: ResizeDirection) => void,
  }

export const minNoteSize = 100

const Note = ({ position, dimension, color, isMoving, onNoteMouseDown, onHandleMouseDown }: NoteProps) => {
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
      onMouseDown={ onNoteMouseDown }
    >
      { resizeDirections.map(direction =>
          <Handle
            key={ direction }
            direction={ direction }
            onMouseDown={ onHandleMouseDown }
          />
        )
      }
    </div>
  )
}

export default Note
