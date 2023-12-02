import { createSignal } from "solid-js"
import { useAudio } from "../modules/audio"

const { startSound, stopSound } = useAudio()

const Home = () => {
  return (
    <section>
      <button type="button" onMouseDown={startSound} onMouseUp={stopSound}>
        play
      </button>
    </section>
  )
}

export default Home
