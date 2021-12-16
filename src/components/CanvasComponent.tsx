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
  var ccount = 0 // counts()を回した回数
  var count = 0 // スクワット回数もどき
  var max: number = 900
  var min: number = 0
  var down: boolean = false
  var up: boolean = false

  const sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(800, 900)
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

    ml5.modelReady = () => {
      console.log('ready!')
    }

    // 0.01秒ごとに実行される
    p.draw = () => {
      video && p.image(video, 0, 0, p.width, p.height)
      if (!poses) return
      if (poses.length === 0) return
      // console.log(poses)
      drawKeypoints()
      drawSkeleton()
      counts()
      ccount++
    }

    function drawKeypoints() {
      let pose = poses[0].pose
      for (let j = 0; j < pose.keypoints.length; j++) {
        let keypoint = pose.keypoints[j]
        if (keypoint.score > 0.2) {
          p.fill(0, 0, 0)
          p.stroke(255, 255, 255)
          p.strokeWeight(8)
          p.ellipse(keypoint.position.x, keypoint.position.y, 20, 20)
        }
      }
    }

    function drawSkeleton() {
      let skeleton = poses[0].skeleton
      for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0]
        let partB = skeleton[j][1]
        p.stroke(255, 255, 255)
        p.strokeWeight(20)
        p.line(
          partA.position.x,
          partA.position.y,
          partB.position.x,
          partB.position.y
        )
      }
    }

    function counts() {
      let dis: number
      let nose = poses[0].pose.keypoints[0]
      // console.log(nose)
      let position: number = nose.position.y // ※上に行くほどyの値が小さくなる
      // console.log(position)
      // 精度が0.9以上の時最大値最小値を更新
      if (nose.score > 0.9) updateM(position)
      // console.log(nose.score)
      // console.log(max)
      dis = (min - max) / 3
      // 回数0回の時、始まってから2秒経ち、max+disより高くなれば1回
      if (count == 0 && ccount > 200 && max + dis > position) {
        count = 1
        // console.log('count = 1')
      }

      if (count > 0) {
        if (position >= min - dis) down = true
        if (position <= max + dis) up = true
        if (down == true && up == true) {
          count++
          down = false
          up = false
        }
      }
      // スクワット回数表示
      if (count % 2 != 0) {
        console.log(count / 2 + 0.5)
      }
    }

    // ※上に行くほどyの値が小さくなる
    function updateM(yposition: number) {
      if (yposition < max) max = yposition
      if (yposition > min) min = yposition
    }
  }

  return <Sketch sketch={sketch} />
}
