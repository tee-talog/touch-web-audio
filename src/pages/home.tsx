import { createSignal } from "solid-js"
import { useAudio } from "../modules/audio"

const { startSound, stopSound, changePitch } = useAudio()

const Home = () => {
  const [isPlaying, setPlaying] = createSignal(false)

  const press = () => {
    if (isPlaying()) {
      return
    }
    setPlaying(true)
    startSound()
  }

  // FIXME マウスとキーボード両方で鳴らしているとき、片方を離すと音が途切れる
  const release = () => {
    if (!isPlaying()) {
      return
    }
    setPlaying(false)
    stopSound()
  }

  return (
    <section>
      <button
        type="button"
        onMouseDown={press}
        onMouseUp={release}
        onKeyDown={press}
        onKeyUp={release}
        onMouseLeave={release}
      >
        play
      </button>

      {/* 仮 */}
      <button type="button" onClick={() => changePitch("C")}>
        change
      </button>
    </section>
  )
}

export default Home
