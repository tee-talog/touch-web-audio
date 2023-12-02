export const useAudio = () => {
  // 初期化
  const audioContext = new AudioContext()
  const oscillatorNode = new OscillatorNode(audioContext, {
    type: "sawtooth",
    frequency: 440,
  })
  // 再生・停止をエミュレートする
  const oscillatorPlayGainNode = new GainNode(audioContext, { gain: 0.5 })
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
  const startSound = () => {
    // start() はユーザー入力に反応する必要がある
    if (!isInit) {
      oscillatorNode.start()
      isInit = true
    }
    oscillatorPlayGainNode.gain.setValueAtTime(1, audioContext.currentTime)
  }

  const stopSound = () => {
    oscillatorPlayGainNode.gain.setValueAtTime(0, audioContext.currentTime)
  }

  return {
    startSound,
    stopSound,
  }
}
