export const colors = ['cyan', 'green', 'orange', 'pink', 'purple', 'red', 'yellow'] as const
export type Color = typeof colors[number]

export const getRandomColor = (except?: Color) => {
  const filtered = except ? colors.filter(color => color !== except) : colors
  return filtered[Math.floor(Math.random() * filtered.length)]
}


export const resizeDirections = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const
export type ResizeDirection = typeof resizeDirections[number]


export interface Vector {
  x: number
  y: number
}

export const vecAdd = (v1: Vector, v2: Vector): Vector => ({ x: v1.x + v2.x, y: v1.y + v2.y })
export const vecSub = (v1: Vector, v2: Vector): Vector => ({ x: v1.x - v2.x, y: v1.y - v2.y })
export const getBoundingBox = (v1: Vector, v2: Vector): { position: Vector, dimension: Vector } => {
  const position = {
    x: Math.min(v1.x, v2.x),
    y: Math.min(v1.y, v2.y),
  }
  const dimension = {
    x: Math.max(v1.x, v2.x) - position.x,
    y: Math.max(v1.y, v2.y) - position.y,
  }
  return { position, dimension }
}

