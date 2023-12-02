import { createSignal } from "solid-js"
import { useAudio } from "../modules/audio"

const { startSound, stopSound } = useAudio()

const Home = () => {
  return (
    <section>
      <button type="button" onClick={startSound}>
        start
      </button>
      <button type="button" onClick={stopSound}>
        stop
      </button>
    </section>
  )
}

export default Home
