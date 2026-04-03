/* ============================================
   JENNY FIGMENT — Kids Zone blank drawing canvas
   Touch & mouse, undo, save PNG
   ============================================ */

const W = 600;
const H = 600;
const UNDO_MAX = 15;

function fillWhite(ctx) {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('coloring-canvas');
  const clearBtn = document.getElementById('btn-clear');
  const saveBtn = document.getElementById('btn-save');
  const undoBtn = document.getElementById('btn-undo');
  const palette = document.getElementById('color-palette');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  let currentColor = '#FA036B';
  let brushSize = 6;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let strokeDirty = false;
  const undoStack = [];

  function syncUndoButton() {
    if (undoBtn) undoBtn.disabled = undoStack.length <= 1;
  }

  function pushUndoSnapshot() {
    undoStack.push(ctx.getImageData(0, 0, W, H));
    while (undoStack.length > UNDO_MAX) undoStack.shift();
    syncUndoButton();
  }

  function resetFillAndUndo() {
    fillWhite(ctx);
    undoStack.length = 0;
    pushUndoSnapshot();
    syncUndoButton();
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    let clientX;
    let clientY;
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

  function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    strokeDirty = false;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;

    ctx.beginPath();
    ctx.arc(lastX, lastY, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = currentColor;
    ctx.fill();
    strokeDirty = true;
  }

  function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;

    const pos = getPos(e);
    strokeDirty = true;

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

  function endDraw(e) {
    if (e) e.preventDefault();
    if (isDrawing && strokeDirty) pushUndoSnapshot();
    isDrawing = false;
    strokeDirty = false;
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);

  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', endDraw, { passive: false });

  palette?.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      palette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('is-selected'));
      swatch.classList.add('is-selected');
      currentColor = swatch.dataset.color || '#FA036B';
    });
  });

  document.querySelectorAll('.brush-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.brush-size-btn').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      brushSize = parseInt(btn.dataset.size, 10) || 6;
    });
  });

  undoBtn?.addEventListener('click', () => {
    if (undoStack.length <= 1) return;
    undoStack.pop();
    const prev = undoStack[undoStack.length - 1];
    ctx.putImageData(prev, 0, 0);
    syncUndoButton();
  });

  clearBtn?.addEventListener('click', () => {
    if (window.confirm('Start over? Your drawing will be erased.')) {
      resetFillAndUndo();
    }
  });

  saveBtn?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  resetFillAndUndo();
});
