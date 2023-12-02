export const useAudio = () => {
  // 初期化
  const audioContext = new AudioContext()
  const oscillatorNode = new OscillatorNode(audioContext, {
    type: "sawtooth",
    frequency: 440,
  })
  const gainNode = new GainNode(audioContext, { gain: 0.5 })
  const masterVolumeGainNode = new GainNode(audioContext, { gain: 0.1 })

  // 接続
  oscillatorNode.connect(gainNode)
  gainNode.connect(masterVolumeGainNode)
  masterVolumeGainNode.connect(audioContext.destination)

  // 操作
  const startSound = () => {
    oscillatorNode.start()
  }

  const stopSound = () => {
    oscillatorNode.stop()
  }

  return {
    startSound,
    stopSound,
  }
}
