import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'

type Props = {
  sketch: any
}

export const P5Wrapper: React.FC<Props> = (props) => {
  const [p5Instance, setP5Instance] = useState<p5>()
  const wrapperRef = useRef()

  useEffect(() => {
    if (wrapperRef.current === null) return
    setP5Instance(new p5(props.sketch, wrapperRef.current))
  }, [props.sketch])

  return <div ref={wrapperRef} />
}
