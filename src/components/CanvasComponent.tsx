import dynamic from 'next/dynamic'
import type p5 from 'p5'
import { useEffect, useState } from 'react'

export const CanvasComponent = () => {
  const Sketch = dynamic(
    () => import('./P5Wrapper').then((mod) => mod.P5Wrapper),
    {
      loading: () => <p>Loading...</p>,
      ssr: false
    }
  )

  const [ml5, setMl5] = useState<any>()
  useEffect(() => {
    setMl5(require('ml5'))
  }, [])

  let video
  let poseNet
  let poses

  const sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(720, 480)
      video = p.createCapture(p.VIDEO)
      if (!video) return
      video.size(p.width, p.height)
      poseNet = ml5.poseNet(video, ml5.modelReady)

      poseNet &&
        poseNet.on('pose', (results) => {
          poses = results
        })
      video.hide()
    }

    p.draw = () => {
      video && p.image(video, 0, 0, p.width, p.height)
      console.log(poses)
      drawKeypoints()
      drawSkeleton()
    }

    function drawKeypoints() {
      if (!poses) return
      for (let i = 0; i < poses.length; i++) {
        let pose = poses[i].pose
        for (let j = 0; j < pose.keypoints.length; j++) {
          let keypoint = pose.keypoints[j]
          if (keypoint.score > 0.2) {
            p.fill(255, 0, 0)
            p.noStroke()
            p.ellipse(keypoint.position.x, keypoint.position.y, 10, 10)
          }
        }
      }
    }

    function drawSkeleton() {
      if (!poses) return
      for (let i = 0; i < poses.length; i++) {
        let skeleton = poses[i].skeleton
        for (let j = 0; j < skeleton.length; j++) {
          let partA = skeleton[j][0]
          let partB = skeleton[j][1]
          p.stroke(255, 0, 0)
          p.line(
            partA.position.x,
            partA.position.y,
            partB.position.x,
            partB.position.y
          )
        }
      }
    }
  }

  return <Sketch sketch={sketch} />
}
