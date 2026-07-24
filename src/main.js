/* Bootstrap: canvas scaling, input, and the fixed-timestep game loop. */
(function (global) {
  'use strict'

  const G = global.G
  const canvas = document.getElementById('screen')
  const ctx = canvas.getContext('2d', { alpha: false })
  ctx.imageSmoothingEnabled = false

  const game = new G.Game(ctx)
  global.game = game // handy for poking around in the console

  /* --- Input ------------------------------------------------------------- */

  const input = {
    left: false,
    right: false,
    fire: false,
    firePressed: false,
    startPressed: false
  }

  const held = new Set()

  const KEYMAP = {
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right',
    Space: 'fire',
    ArrowUp: 'fire',
    KeyW: 'fire',
    Enter: 'start',
    NumpadEnter: 'start'
  }

  function setKey (action, down) {
    if (action === 'left' || action === 'right') input[action] = down
    else if (action === 'fire') {
      if (down && !input.fire) input.firePressed = true
      input.fire = down
    } else if (action === 'start') {
      if (down) input.startPressed = true
    }
  }

  global.addEventListener('keydown', e => {
    // Let the browser keep its own shortcuts when a modifier is involved.
    if (e.ctrlKey || e.metaKey || e.altKey) return

    if (e.code === 'KeyP') {
      game.paused = !game.paused
      G.Sfx.resume()
      e.preventDefault()
      return
    }
    if (e.code === 'KeyM') {
      G.Sfx.init()
      G.Sfx.toggleMute()
      e.preventDefault()
      return
    }
    if (e.code === 'KeyF') {
      toggleFullscreen()
      e.preventDefault()
      return
    }

    const action = KEYMAP[e.code]
    if (!action) return
    e.preventDefault()
    G.Sfx.resume()
    if (held.has(e.code)) return
    held.add(e.code)
    setKey(action, true)
  })

  global.addEventListener('keyup', e => {
    const action = KEYMAP[e.code]
    if (!action) return
    e.preventDefault()
    held.delete(e.code)
    // Only clear a direction if no other key bound to it is still down.
    const stillHeld = Object.keys(KEYMAP).some(code => KEYMAP[code] === action && held.has(code))
    if (!stillHeld) setKey(action, false)
  })

  global.addEventListener('blur', () => {
    held.clear()
    input.left = input.right = input.fire = false
  })

  /* Touch: three zones along the bottom of the screen. */
  const touch = document.getElementById('touch')
  if (touch) {
    for (const zone of touch.querySelectorAll('div')) {
      const action = zone.dataset.key
      const press = e => {
        e.preventDefault()
        G.Sfx.resume()
        if (game.state === 'attract' && action === 'fire') input.startPressed = true
        setKey(action, true)
      }
      const release = e => {
        e.preventDefault()
        setKey(action, false)
      }
      zone.addEventListener('pointerdown', press)
      zone.addEventListener('pointerup', release)
      zone.addEventListener('pointercancel', release)
      zone.addEventListener('pointerleave', release)
    }
  }

  /* --- Presentation ------------------------------------------------------ */

  function toggleFullscreen () {
    const el = document.documentElement
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  /** Scale the canvas by the largest whole number that still fits. */
  function resize () {
    const pad = global.matchMedia('(pointer: coarse)').matches ? 0.72 : 0.92
    const scale = Math.max(
      1,
      Math.min(
        Math.floor((global.innerWidth * 0.96) / G.W),
        Math.floor((global.innerHeight * pad) / G.H)
      )
    )
    canvas.style.width = G.W * scale + 'px'
    canvas.style.height = G.H * scale + 'px'
  }

  global.addEventListener('resize', resize)
  resize()

  /* --- Loop -------------------------------------------------------------- */

  let last = performance.now()
  let accumulator = 0

  function frame (now) {
    requestAnimationFrame(frame)

    // Clamp so a backgrounded tab doesn't fast-forward the whole game.
    const elapsed = Math.min(100, now - last)
    last = now
    accumulator += elapsed

    let steps = 0
    while (accumulator >= G.STEP && steps < 5) {
      accumulator -= G.STEP
      steps++
      if (!game.paused) game.update(1, input)
      // Edge-triggered flags last exactly one simulation step.
      input.firePressed = false
      input.startPressed = false
    }

    game.draw()
  }

  requestAnimationFrame(frame)
})(window)
