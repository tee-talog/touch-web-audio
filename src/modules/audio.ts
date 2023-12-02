const attackTime = 0.1
const decayTime = 0.1
const releaseTime = 0.1
const attackLevel = 1
const sustainLevel = 0.7

const keySignatureSharp = ["#", "♯"] as const
const keySignatureFlat = ["b", "♭"] as const
const keySignatureDoubleSharp = ["##", "𝄪"] as const
const keySignatureDoubleFlat = ["bb", "𝄫"] as const
const keySignatureNatural = ["♮"] as const
const keySignature = [
  ...keySignatureSharp,
  ...keySignatureFlat,
  ...keySignatureDoubleSharp,
  ...keySignatureDoubleFlat,
  ...keySignatureNatural,
] as const

const pitchNameBase = ["C", "D", "E", "F", "G", "A", "B"] as const

const normalizedPitchName = [
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
type KeySignature = (typeof keySignature)[number]
type PitchName = `${PitchNameBase}${"" | KeySignature}`

const convertPitchNameToFrequency = (pitchName: PitchName, octave = 4) => {
  const [p, ..._ks] = pitchName
  const ks = _ks.join("")

  let index = normalizedPitchName.indexOf(p)

  if (ks === "" || keySignatureNatural.some((e) => e === ks)) {
    // 調号なし
    // NOP
  } else if (keySignatureSharp.some((e) => e === ks)) {
    index = (index + 1) % normalizedPitchName.length
  } else if (keySignatureFlat.some((e) => e === ks)) {
    index = (index - 1) % normalizedPitchName.length
  } else if (keySignatureDoubleSharp.some((e) => e === ks)) {
    index = (index + 2) % normalizedPitchName.length
  } else if (keySignatureDoubleFlat.some((e) => e === ks)) {
    index = (index - 2) % normalizedPitchName.length
  }
  const frequency = 440 * Math.pow(2, (octave * 12 + index - 57) / 12)
  return frequency
}

const isPitchName = (str: string): str is PitchName => {
  const [p, ..._ks] = str
  const ks = _ks.join("")
  return (
    pitchNameBase.some((e) => e === p) &&
    ["", ...keySignature].some((e) => e === ks)
  )
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
  // チャンネルゲイン
  const channelGainNode = new GainNode(audioContext, { gain: 0.5 })
  // マスターボリューム
  const masterVolumeGainNode = new GainNode(audioContext, { gain: 0.2 })
  // ローパス
  const lowpassFilter = new BiquadFilterNode(audioContext, {
    type: "lowpass",
    frequency: 1000,
    Q: 10,
  })
  // ディレイ
  const delayNode = new DelayNode(audioContext, { delayTime: 0.2 })
  const delayFeedbackNode = new GainNode(audioContext, { gain: 0.5 })

  // 接続
  oscillatorNode.connect(oscillatorPlayGainNode)
  oscillatorPlayGainNode.connect(lowpassFilter)
  // ローパスから、チャンネルゲインとディレイへ接続
  lowpassFilter.connect(channelGainNode)
  lowpassFilter.connect(delayNode)
  // ディレイ内部接続
  delayNode.connect(delayFeedbackNode)
  delayFeedbackNode.connect(delayNode)
  // ディレイからチャンネルゲインへの接続
  delayNode.connect(channelGainNode)
  // チャンネルゲインからマスターへ接続
  channelGainNode.connect(masterVolumeGainNode)
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
    // attack, decay の予定をキャンセル
    oscillatorPlayGainNode.gain.cancelAndHoldAtTime(0)

    // release
    // 開始音量を設定
    oscillatorPlayGainNode.gain.setValueAtTime(
      oscillatorPlayGainNode.gain.value,
      audioContext.currentTime,
    )

    // 減らしていく
    oscillatorPlayGainNode.gain.linearRampToValueAtTime(
      0,
      audioContext.currentTime + releaseTime,
    )
  }

  // 音程の変更
  const changePitch = (pitchName: string) => {
    if (!isPitchName(pitchName)) {
      // TODO エラー処理？
      return
    }
    oscillatorNode.frequency.value = convertPitchNameToFrequency(pitchName)
  }

  return {
    startSound,
    stopSound,
    changePitch,
  }
}
