document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('stage');
  const dot = document.getElementById('dot');
  const startStop = document.getElementById('startStop');
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const speedRange = document.getElementById('speedRange');
  const speedLabel = document.getElementById('speedLabel');
  const heartbeatAudio = document.getElementById('heartbeat');

  let running = false;
  let direction = 1; // 1 -> right, -1 -> left
  let speedBPM = parseInt(speedRange.value, 10);
  let pos = 0; // 0…1, Position innerhalb Stage
  let lastTimestamp = null;
  let beatTimer = null;

  const updateSpeedLabel = () => speedLabel.textContent = speedBPM;
  updateSpeedLabel();

  /* --- Audio & Beat Sync --- */
  const startBeats = () => {
    stopBeats(); // Reset existing
    const interval = 60000 / speedBPM; // ms per beat
    beatTimer = setInterval(() => {
      heartbeatAudio.currentTime = 0;
      heartbeatAudio.play();
    }, interval);
  };

  const stopBeats = () => {
    if (beatTimer) {
      clearInterval(beatTimer);
      beatTimer = null;
    }
    heartbeatAudio.pause();
    heartbeatAudio.currentTime = 0;
  };

  /* --- Control Flow --- */
  const start = () => {
    running = true;
    startStop.textContent = 'Stop';
    lastTimestamp = null;
    startBeats();
    requestAnimationFrame(step);
  };

  const stop = () => {
    running = false;
    startStop.textContent = 'Start';
    stopBeats();
  };

  startStop.addEventListener('click', () => running ? stop() : start());

  /* --- Menu Handling --- */
  menuBtn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
    const open = !menu.classList.contains('hidden');
    menu.setAttribute('aria-hidden', (!open).toString());
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    const clickInsideMenu = menu.contains(e.target);
    const clickMenuBtn = menuBtn.contains(e.target);
    if (!clickInsideMenu && !clickMenuBtn && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      menu.setAttribute('aria-hidden', 'true');
    }
  });

  speedRange.addEventListener('input', () => {
    speedBPM = parseInt(speedRange.value, 10);
    updateSpeedLabel();
    if (running) startBeats();
  });

  /* --- Animation Loop --- */
  const step = (timestamp) => {
    if (!running) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000; // sec
    lastTimestamp = timestamp;

    const bps = speedBPM / 60;
    // A full cycle L->R->L is 2 beats
    const cycleTime = 2 / bps; // sec
    const distancePerSecond = 2 / cycleTime; // pos units per second (0…1..0 range)

    pos += direction * distancePerSecond * dt;

    if (pos >= 1) {
      pos = 1;
      direction = -1;
    } else if (pos <= 0) {
      pos = 0;
      direction = 1;
    }

    updateDotPosition();
    requestAnimationFrame(step);
  };

  /* --- Helpers --- */
  const updateDotPosition = () => {
    const stageWidth = stage.clientWidth;
    const dotWidth = dot.clientWidth;
    // Boundaries: padding 20 px on each side
    const offset = 20;
    const travel = stageWidth - dotWidth - offset * 2;
    const x = offset + pos * travel;
    dot.style.transform = `translate(${x}px, -50%)`;
  };

  // Keep position in sync on resize
  window.addEventListener('resize', updateDotPosition);
  updateDotPosition();
});
