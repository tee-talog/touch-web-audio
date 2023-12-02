import { createSignal } from "solid-js"
import { useAudio } from "../modules/audio"

// TODO ユーザー入力があってから init する
const { startSound, stopSound } = useAudio()

const Home = () => {
  return (
    <section>
      <button type="button" onclick={startSound}>
        start
      </button>
      <button type="button" onclick={stopSound}>
        stop
      </button>
    </section>
  )
}

export default Home
