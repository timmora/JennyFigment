/* ============================================
   JENNY FIGMENT — Arachna Coloring Canvas
   Brush painting mode — touch & mouse support
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('coloring-canvas');
  const clearBtn = document.getElementById('btn-clear');
  const saveBtn = document.getElementById('btn-save');
  const palette = document.getElementById('color-palette');
  const wrapper = document.getElementById('canvas-wrapper');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  let currentColor = '#FA036B';
  let brushSize = 6;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // ── Resize canvas to fill wrapper ───────────────────────────────────────
  function resizeCanvas() {
    if (!wrapper) return;
    const wrapperWidth = wrapper.clientWidth;
    // Keep 1:1 aspect ratio, max 600
    const size = Math.min(wrapperWidth, 600);

    // Save current drawing
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    // Don't change canvas.width/height (keeps drawing coordinates consistent at 600x600)

    ctx.putImageData(imgData, 0, 0);
  }

  // ── Draw the Arachna outline (SVG-based line drawing via canvas) ─────────
  function drawOutline() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#2B161B';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw a simplified spider / Arachna figure using canvas paths
    const cx = 300, cy = 280;

    // Body (abdomen)
    ctx.beginPath();
    ctx.ellipse(cx, cy + 60, 70, 90, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Head (cephalothorax)
    ctx.beginPath();
    ctx.ellipse(cx, cy - 20, 50, 55, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes (4 pairs typical for spiders)
    [[cx - 20, cy - 35], [cx, cy - 38], [cx + 20, cy - 35],
     [cx - 12, cy - 25], [cx + 12, cy - 25]].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.arc(ex, ey, 5, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Smile
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 18, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Legs (8 legs, 4 each side)
    const legPairs = [
      // [start angle, length, sweep]
      [-0.8, 130, -0.5],
      [-0.4, 140, -0.3],
      [0.1, 140, -0.1],
      [0.5, 130, 0.2],
    ];

    legPairs.forEach(([startAngle, len, bend], i) => {
      // Left legs
      const lx1 = cx - 48 * Math.cos(startAngle);
      const ly1 = cy + 48 * Math.sin(startAngle) - 20;
      const midAngle = startAngle - 0.4;
      const lmx = lx1 - (len * 0.5) * Math.cos(midAngle);
      const lmy = ly1 + (len * 0.5) * Math.sin(midAngle);
      const lx2 = lmx - (len * 0.5) * Math.cos(midAngle + bend);
      const ly2 = lmy + (len * 0.5) * Math.sin(midAngle + bend);

      ctx.beginPath();
      ctx.moveTo(cx - 45, cy - 20 + i * 25);
      ctx.quadraticCurveTo(lmx, lmy, lx2, ly2);
      ctx.stroke();

      // Right legs (mirror)
      const rx1 = cx + 48 * Math.cos(startAngle);
      const ry1 = cy + 48 * Math.sin(startAngle) - 20;
      const rmx = rx1 + (len * 0.5) * Math.cos(midAngle);
      const rmy = ry1 + (len * 0.5) * Math.sin(midAngle);
      const rx2 = rmx + (len * 0.5) * Math.cos(midAngle + bend);
      const ry2 = rmy + (len * 0.5) * Math.sin(midAngle + bend);

      ctx.beginPath();
      ctx.moveTo(cx + 45, cy - 20 + i * 25);
      ctx.quadraticCurveTo(rmx, rmy, rx2, ry2);
      ctx.stroke();
    });

    // Abdomen pattern (spots)
    [[cx, cy + 40], [cx - 20, cy + 70], [cx + 20, cy + 70],
     [cx, cy + 100], [cx - 15, cy + 125], [cx + 15, cy + 125]].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Web strand coming from spinnerets
    ctx.beginPath();
    ctx.moveTo(cx, cy + 150);
    ctx.lineTo(cx, cy + 210);
    ctx.stroke();

    // Fun banner / sign on web
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy + 215);
    ctx.lineTo(cx + 60, cy + 215);
    ctx.lineTo(cx + 55, cy + 255);
    ctx.lineTo(cx - 55, cy + 255);
    ctx.closePath();
    ctx.stroke();

    // "Hi!" text inside banner
    ctx.font = 'bold 24px "Fredoka", sans-serif';
    ctx.fillStyle = '#2B161B';
    ctx.textAlign = 'center';
    ctx.fillText("Hi! I'm Arachna!", cx, cy + 242);

    // Decorative stars around
    [[-110, -80], [110, -80], [-130, 50], [130, 50]].forEach(([dx, dy]) => {
      ctx.font = '28px serif';
      ctx.fillStyle = '#FA036B';
      ctx.fillText('✦', cx + dx, cy + dy);
    });
  }

  // ── Get canvas position from event ──────────────────────────────────────
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  // ── Drawing ──────────────────────────────────────────────────────────────
  function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;

    // Draw a dot at click point
    ctx.beginPath();
    ctx.arc(lastX, lastY, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = currentColor;
    ctx.fill();
  }

  function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;

    const pos = getPos(e);

    ctx.beginPath();
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;
  }

  function stopDraw(e) {
    if (e) e.preventDefault();
    isDrawing = false;
  }

  // Mouse events
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);

  // Touch events
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDraw, { passive: false });

  // ── Color palette ────────────────────────────────────────────────────────
  palette?.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      palette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('is-selected'));
      swatch.classList.add('is-selected');
      currentColor = swatch.dataset.color || '#FA036B';
    });
  });

  // ── Brush size ───────────────────────────────────────────────────────────
  document.querySelectorAll('.brush-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.brush-size-btn').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      brushSize = parseInt(btn.dataset.size, 10) || 6;
    });
  });

  // ── Clear ────────────────────────────────────────────────────────────────
  clearBtn?.addEventListener('click', () => {
    if (window.confirm('Start over? Your coloring will be erased.')) {
      drawOutline();
    }
  });

  // ── Save ─────────────────────────────────────────────────────────────────
  saveBtn?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my-arachna-coloring.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // ── Resize handler ───────────────────────────────────────────────────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
  });

  // ── Initialize ───────────────────────────────────────────────────────────
  resizeCanvas();
  drawOutline();
});
