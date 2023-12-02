const attackTime = 0.1
const decayTime = 0.1
const releaseTime = 0.1
const attackLevel = 1
const sustainLevel = 0.7

const keySignatureSharp = ["#", "♯"]
const keySignatureFlat = ["b", "♭"]
const keySignatureDoubleSharp = ["##", "𝄪"]
const keySignatureDoubleFlat = ["bb", "𝄫"]
const keySignatureNatural = ["♮"]

const pitchNameBase = ["C", "D", "E", "F", "G", "A", "B"] as const

const normalizedPickName = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
]

type PitchNameBase = (typeof pitchNameBase)[number]
type KeySignature = "#" | "♯" | "b" | "♭" | "##" | "𝄪" | "bb" | "𝄫" | "♮"
type PitchName<
  _PitchNameBase extends string = PitchNameBase,
  _KeySignature extends string = "" | KeySignature,
> = `${_PitchNameBase}${_KeySignature}`

const convertPitchNameToFrequency = (pitchName: PitchName, octave = 4) => {
  const [p, ..._ks] = pitchName
  const ks = _ks.join("")

  let index = normalizedPickName.indexOf(p)

  if (ks === "" || keySignatureNatural.includes(ks)) {
    // 調号なし
    // NOP
  } else if (keySignatureSharp.includes(ks)) {
    index = (index + 1) % normalizedPickName.length
  } else if (keySignatureFlat.includes(ks)) {
    index = (index - 1) % normalizedPickName.length
  } else if (keySignatureDoubleSharp.includes(ks)) {
    index = (index + 2) % normalizedPickName.length
  } else if (keySignatureDoubleFlat.includes(ks)) {
    index = (index - 2) % normalizedPickName.length
  }
  const frequency = 440 * Math.pow(2, (octave * 12 + index - 57) / 12)
  return frequency
}

export const useAudio = () => {
  // 初期化
  const audioContext = new AudioContext()
  const oscillatorNode = new OscillatorNode(audioContext, {
    type: "sawtooth",
    frequency: 440,
  })
  // 再生・停止をエミュレートする
  const oscillatorPlayGainNode = new GainNode(audioContext, { gain: 0 })
  const gainNode = new GainNode(audioContext, { gain: 0.5 })
  const masterVolumeGainNode = new GainNode(audioContext, { gain: 0.2 })

  const lowpassFilter = new BiquadFilterNode(audioContext, {
    type: "lowpass",
    frequency: 1000,
    Q: 10,
  })

  // 接続
  oscillatorNode.connect(lowpassFilter)
  lowpassFilter.connect(oscillatorPlayGainNode)
  oscillatorPlayGainNode.connect(gainNode)
  gainNode.connect(masterVolumeGainNode)
  masterVolumeGainNode.connect(audioContext.destination)

  // 操作
  let isInit = false
  // 再生
  const startSound = () => {
    // start() はユーザー入力に反応する必要がある
    if (!isInit) {
      oscillatorNode.start()
      isInit = true
    }

    oscillatorPlayGainNode.gain.setValueAtTime(0, audioContext.currentTime)
    // attack
    oscillatorPlayGainNode.gain.linearRampToValueAtTime(
      attackLevel,
      audioContext.currentTime + attackTime,
    )
    // decay
    oscillatorPlayGainNode.gain.linearRampToValueAtTime(
      sustainLevel,
      audioContext.currentTime + attackTime + decayTime,
    )
  }

  // 停止
  const stopSound = () => {
    oscillatorPlayGainNode.gain.setValueAtTime(
      sustainLevel,
      audioContext.currentTime,
    )
    // release
    oscillatorPlayGainNode.gain.linearRampToValueAtTime(
      0,
      audioContext.currentTime + releaseTime,
    )
  }

  // 音程の変更
  const changePitch = (pitchName: PitchName) => {
    oscillatorNode.frequency.value = convertPitchNameToFrequency(pitchName)
  }

  return {
    startSound,
    stopSound,
    changePitch,
  }
}
