export type Props = { gamepad: Gamepad | undefined; className?: string }

export const selectColor = (gamepad: Gamepad | undefined, index: number) => {
  return gamepad?.buttons?.[index]?.pressed ? '#444' : '#888'
}

export const Up = ({ gamepad, className }: Props) => (
  <svg
    className={className}
    width="25px"
    height="33px"
    viewBox="0 0 25 33"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g
        id="noun_directional-pad_641582"
        transform="translate(-32.200000, 0.000000)"
        fill={selectColor(gamepad, 12)}
        fillRule="nonzero"
      >
        <path
          d="M56.6,21.1 L56.6,5.8 C56.6,2.6 54,0 50.8,0 L38.9,0 C35.7,0 33.1,2.6 33.1,5.8 L33.1,21.1 C33.1,22.6 33.7,24.1 34.8,25.2 L40.8,31.2 C43,33.4 46.7,33.4 48.9,31.2 L54.9,25.2 C56,24.1 56.6,22.6 56.6,21.1 Z"
          id="Path"
        ></path>
      </g>
    </g>
  </svg>
)

export const Right = ({ gamepad, className }: Props) => (
  <svg
    className={className}
    width="34px"
    height="24px"
    viewBox="0 0 34 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g
        id="noun_directional-pad_641582"
        transform="translate(-56.200000, -33.000000)"
        fill={selectColor(gamepad, 15)}
        fillRule="nonzero"
      >
        <path
          d="M64.5,34.8 L58.5,40.8 C56.3,43 56.3,46.7 58.5,48.9 L64.5,54.9 C65.6,56 67,56.6 68.6,56.6 L83.9,56.6 C87.1,56.6 89.7,54 89.7,50.8 L89.7,38.9 C89.7,35.7 87.1,33.1 83.9,33.1 L68.6,33.1 C67,33.1 65.6,33.7 64.5,34.8 Z"
          id="Path"
        ></path>
      </g>
    </g>
  </svg>
)

export const Down = ({ gamepad, className }: Props) => (
  <svg
    className={className}
    width="25px"
    height="34px"
    viewBox="0 0 25 34"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g
        id="noun_directional-pad_641582"
        transform="translate(-32.200000, -56.000000)"
        fill={selectColor(gamepad, 13)}
        fillRule="nonzero"
      >
        <path
          d="M33.1,68.6 L33.1,83.9 C33.1,87.1 35.7,89.7 38.9,89.7 L50.8,89.7 C54,89.7 56.6,87.1 56.6,83.9 L56.6,68.6 C56.6,67.1 56,65.6 54.9,64.5 L48.9,58.5 C46.7,56.3 43,56.3 40.8,58.5 L34.8,64.5 C33.7,65.6 33.1,67 33.1,68.6 Z"
          id="Path"
        ></path>
      </g>
    </g>
  </svg>
)

export const Left = ({ gamepad, className }: Props) => (
  <svg
    className={className}
    width="34px"
    height="24px"
    viewBox="0 0 34 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g
        id="noun_directional-pad_641582"
        transform="translate(0.800000, -33.000000)"
        fill={selectColor(gamepad, 14)}
        fillRule="nonzero"
      >
        <path
          d="M21.1,33.1 L5.8,33.1 C2.6,33.1 0,35.7 0,38.9 L0,50.8 C0,54 2.6,56.6 5.8,56.6 L21.1,56.6 C22.6,56.6 24.1,56 25.2,54.9 L31.2,48.9 C33.4,46.7 33.4,43 31.2,40.8 L25.2,34.8 C24.1,33.7 22.6,33.1 21.1,33.1 Z"
          id="Path"
        ></path>
      </g>
    </g>
  </svg>
)
