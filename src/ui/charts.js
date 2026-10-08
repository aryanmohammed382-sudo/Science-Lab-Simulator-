// A very small 2D chart used for the notebook and research mode: enough for a
// scatter plot with a line of best fit, axis labels and a grid.
export class Chart {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = opts;
    this.points = [];
    this.series = [];
    this.fit = null;
    this.xLabel = opts.xLabel || 'x';
    this.yLabel = opts.yLabel || 'y';
  }

  setData(points, { fit = null, xLabel, yLabel } = {}) {
    this.points = points || [];
    if (xLabel) this.xLabel = xLabel;
    if (yLabel) this.yLabel = yLabel;
    if (fit) this.fit = fit;
    else this.fit = null;
    this.draw();
  }

  addSeries(points, colour) { this.series.push({ points, colour }); this.draw(); }
  clearSeries() { this.series = []; this.draw(); }

  draw() {
    const { ctx, canvas } = this;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 320, h = canvas.clientHeight || 200;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr; canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const all = [...this.points, ...this.series.flatMap((s) => s.points)];
    const pad = { l: 46, r: 12, t: 14, b: 30 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    ctx.fillStyle = '#0f151b';
    ctx.fillRect(0, 0, w, h);
    let xs = all.map((p) => p.x), ys = all.map((p) => p.y);
    if (!all.length) { xs = [0, 1]; ys = [0, 1]; }
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const spanX = maxX - minX || 1, spanY = maxY - minY || 1;
    const sx = (x) => pad.l + ((x - minX) / spanX) * plotW;
    const sy = (y) => pad.t + plotH - ((y - minY) / spanY) * plotH;
    // grid
    ctx.strokeStyle = '#223040';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const gy = pad.t + (i / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(pad.l + plotW, gy); ctx.stroke();
      const gx = pad.l + (i / 4) * plotW;
      ctx.beginPath(); ctx.moveTo(gx, pad.t); ctx.lineTo(gx, pad.t + plotH); ctx.stroke();
    }
    // axis labels
    ctx.fillStyle = '#8fa3b5';
    ctx.font = '11px system-ui, sans-serif';
    for (let i = 0; i <= 4; i++) {
      const v = minY + (i / 4) * spanY;
      ctx.fillText(v.toFixed(Math.abs(spanY) < 5 ? 2 : 0), 6, pad.t + plotH - (i / 4) * plotH + 4);
      const vx = minX + (i / 4) * spanX;
      ctx.fillText(vx.toFixed(Math.abs(spanX) < 5 ? 2 : 0), pad.l + (i / 4) * plotW - 8, h - 10);
    }
    ctx.fillText(this.yLabel, 6, 11);
    ctx.save();
    ctx.translate(w - 30, h - 10);
    ctx.fillText(this.xLabel, 0, 0);
    ctx.restore();
    // axes
    ctx.strokeStyle = '#4a6076';
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + plotH); ctx.lineTo(pad.l + plotW, pad.t + plotH);
    ctx.stroke();
    // series
    for (const s of this.series) {
      ctx.strokeStyle = s.colour || '#3fa9f5';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      s.points.forEach((p, i) => (i ? ctx.lineTo(sx(p.x), sy(p.y)) : ctx.moveTo(sx(p.x), sy(p.y))));
      ctx.stroke();
    }
    // best fit
    if (this.fit) {
      ctx.strokeStyle = '#f5b83f';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(sx(minX), sy(this.fit.slope * minX + this.fit.intercept));
      ctx.lineTo(sx(maxX), sy(this.fit.slope * maxX + this.fit.intercept));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f5b83f';
      ctx.fillText(`gradient ${this.fit.slope.toPrecision(3)}  R2 ${this.fit.r2.toFixed(3)}`, pad.l + 6, pad.t + 12);
    }
    // points
    ctx.fillStyle = '#7fd4ff';
    for (const p of this.points) {
      ctx.beginPath();
      ctx.arc(sx(p.x), sy(p.y), 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
