/* ============================================================
   charts.js — minimal realistic SVG charts for the notebook
   All charts read CSS custom properties so they re-theme.
   Call renderCharts() on load and after a theme switch.
   ============================================================ */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
  }
  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svgRoot(w, h) {
    const s = el('svg', { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'xMidYMid meet' });
    s.setAttribute('role', 'img');
    return s;
  }
  function txt(x, y, str, opts = {}) {
    const t = el('text', {
      x, y,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': opts.size || 10,
      fill: opts.fill || cssVar('--faint'),
      'text-anchor': opts.anchor || 'middle',
      'font-weight': opts.weight || 400,
    });
    t.textContent = str;
    if (opts.transform) t.setAttribute('transform', opts.transform);
    return t;
  }

  // generic axis frame -> returns {x, y} scale fns
  function frame(svg, W, H, pad, xr, yr) {
    const grid = cssVar('--grid');
    const axis = cssVar('--line-2');
    const x = v => pad.l + ((v - xr[0]) / (xr[1] - xr[0])) * (W - pad.l - pad.r);
    const y = v => H - pad.b - ((v - yr[0]) / (yr[1] - yr[0])) * (H - pad.t - pad.b);
    // gridlines
    for (let i = 0; i <= 4; i++) {
      const gy = pad.t + (i / 4) * (H - pad.t - pad.b);
      svg.appendChild(el('line', { x1: pad.l, y1: gy, x2: W - pad.r, y2: gy, stroke: grid, 'stroke-width': 1 }));
    }
    // axes
    svg.appendChild(el('line', { x1: pad.l, y1: pad.t, x2: pad.l, y2: H - pad.b, stroke: axis, 'stroke-width': 1.5 }));
    svg.appendChild(el('line', { x1: pad.l, y1: H - pad.b, x2: W - pad.r, y2: H - pad.b, stroke: axis, 'stroke-width': 1.5 }));
    return { x, y };
  }

  function path(pts, color, width, dash) {
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    return el('path', { d, fill: 'none', stroke: color, 'stroke-width': width || 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...(dash ? { 'stroke-dasharray': dash } : {}) });
  }

  // ---- 1. calibration curve ----
  function calibration(host) {
    const W = 420, H = 280, pad = { l: 40, r: 16, t: 16, b: 34 };
    const svg = svgRoot(W, H);
    const sc = frame(svg, W, H, pad, [0, 1], [0, 1]);
    // perfect reference diagonal
    svg.appendChild(path([[sc.x(0), sc.y(0)], [sc.x(1), sc.y(1)]], cssVar('--faint'), 1.5, '5 4'));
    // model curve (slightly wavy, well calibrated)
    const model = [0, .08, .19, .31, .39, .52, .58, .71, .82, .9, 1].map((v, i) => {
      const p = i / 10;
      return [sc.x(p), sc.y(v)];
    });
    svg.appendChild(path(model, cssVar('--c0'), 2.5));
    // benchmark (statsbomb) faint
    const bench = [0, .1, .2, .3, .41, .49, .61, .69, .8, .91, 1].map((v, i) => [sc.x(i / 10), sc.y(v)]);
    svg.appendChild(path(bench, cssVar('--c1'), 2, '3 3'));
    // points
    model.forEach(p => svg.appendChild(el('circle', { cx: p[0], cy: p[1], r: 3, fill: cssVar('--c0') })));
    // labels
    svg.appendChild(txt(W / 2, H - 8, 'predicted probability'));
    svg.appendChild(txt(0, 0, 'observed freq', { transform: `translate(12 ${H / 2}) rotate(-90)` }));
    // legend
    svg.appendChild(el('rect', { x: pad.l + 8, y: pad.t + 6, width: 16, height: 3, fill: cssVar('--c0') }));
    svg.appendChild(txt(pad.l + 28, pad.t + 12, 'my model', { anchor: 'start', size: 9 }));
    svg.appendChild(el('rect', { x: pad.l + 8, y: pad.t + 20, width: 16, height: 3, fill: cssVar('--c1') }));
    svg.appendChild(txt(pad.l + 28, pad.t + 26, 'statsbomb', { anchor: 'start', size: 9 }));
    host.appendChild(svg);
  }

  // ---- 2. equity / bankroll curve ----
  function equity(host) {
    const W = 420, H = 280, pad = { l: 42, r: 16, t: 16, b: 34 };
    const svg = svgRoot(W, H);
    const sc = frame(svg, W, H, pad, [0, 1380], [-8, 14]);
    // zero reference
    svg.appendChild(path([[sc.x(0), sc.y(0)], [sc.x(1380), sc.y(0)]], cssVar('--faint'), 1.2, '4 4'));
    // jagged bankroll with drawdowns, ends ~ +5.7
    const seed = [0, 1.2, .4, 2.1, 3.4, 2.0, 4.6, 3.1, 5.8, 4.0, 7.1, 9.2, 6.3, 8.0, 5.1, 7.4, 10.2, 8.3, 6.0, 4.2, 6.8, 9.0, 7.2, 5.7];
    const pts = seed.map((v, i) => [sc.x((i / (seed.length - 1)) * 1380), sc.y(v)]);
    // area fill
    const area = el('path', {
      d: pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') +
        ` L ${sc.x(1380)} ${sc.y(0)} L ${sc.x(0)} ${sc.y(0)} Z`,
      fill: cssVar('--c2'), opacity: .12,
    });
    svg.appendChild(area);
    svg.appendChild(path(pts, cssVar('--c2'), 2.4));
    svg.appendChild(txt(W / 2, H - 8, 'bets placed →'));
    svg.appendChild(txt(0, 0, 'yield %', { transform: `translate(12 ${H / 2}) rotate(-90)` }));
    svg.appendChild(txt(sc.x(1380) - 4, sc.y(5.7) - 6, '+5.7%', { anchor: 'end', fill: cssVar('--c2'), weight: 600, size: 10 }));
    host.appendChild(svg);
  }

  // ---- 3. xG distribution histogram ----
  function histogram(host) {
    const W = 420, H = 280, pad = { l: 40, r: 16, t: 16, b: 34 };
    const svg = svgRoot(W, H);
    const sc = frame(svg, W, H, pad, [0, 1], [0, 100]);
    const bins = [100, 64, 41, 27, 18, 12, 9, 6, 4, 3];
    const bw = (W - pad.l - pad.r) / bins.length;
    bins.forEach((v, i) => {
      const bx = pad.l + i * bw + 2;
      const by = sc.y(v);
      svg.appendChild(el('rect', { x: bx, y: by, width: bw - 4, height: (H - pad.b) - by, fill: cssVar('--c0'), opacity: .85, rx: 1 }));
    });
    svg.appendChild(txt(W / 2, H - 8, 'predicted xG per shot'));
    svg.appendChild(txt(0, 0, 'count (k)', { transform: `translate(12 ${H / 2}) rotate(-90)` }));
    host.appendChild(svg);
  }

  // ---- 4. training loss curve ----
  function loss(host) {
    const W = 420, H = 280, pad = { l: 42, r: 16, t: 16, b: 34 };
    const svg = svgRoot(W, H);
    const sc = frame(svg, W, H, pad, [0, 40], [0, 6]);
    const train = [], val = [];
    for (let e = 0; e <= 40; e++) {
      train.push([sc.x(e), sc.y(5.6 * Math.exp(-e / 9) + 0.9)]);
      val.push([sc.x(e), sc.y(5.4 * Math.exp(-e / 8) + 1.25 + 0.12 * Math.sin(e / 3))]);
    }
    svg.appendChild(path(train, cssVar('--c0'), 2.4));
    svg.appendChild(path(val, cssVar('--c3'), 2.2, '4 3'));
    svg.appendChild(txt(W / 2, H - 8, 'epoch'));
    svg.appendChild(txt(0, 0, 'loss', { transform: `translate(12 ${H / 2}) rotate(-90)` }));
    svg.appendChild(el('rect', { x: W - pad.r - 92, y: pad.t + 6, width: 14, height: 3, fill: cssVar('--c0') }));
    svg.appendChild(txt(W - pad.r - 74, pad.t + 12, 'train', { anchor: 'start', size: 9 }));
    svg.appendChild(el('rect', { x: W - pad.r - 92, y: pad.t + 20, width: 14, height: 3, fill: cssVar('--c3') }));
    svg.appendChild(txt(W - pad.r - 74, pad.t + 26, 'val', { anchor: 'start', size: 9 }));
    host.appendChild(svg);
  }

  // ---- 5. playful "xG of my week" bars ----
  function week(host) {
    const W = 460, H = 260, pad = { l: 40, r: 16, t: 20, b: 46 };
    const svg = svgRoot(W, H);
    const sc = frame(svg, W, H, pad, [0, 7], [0, 1]);
    const data = [
      ['Mon', .12, '--c0'], ['Tue', .34, '--c0'], ['Wed', .71, '--c2'],
      ['Thu', .28, '--c0'], ['Fri', .92, '--c1'], ['Sat', .98, '--c3'], ['Sun', .55, '--c0'],
    ];
    const bw = (W - pad.l - pad.r) / 7;
    data.forEach((d, i) => {
      const bx = pad.l + i * bw + 6;
      const by = sc.y(d[1]);
      svg.appendChild(el('rect', { x: bx, y: by, width: bw - 12, height: (H - pad.b) - by, fill: cssVar(d[2]), rx: 3, opacity: .9 }));
      svg.appendChild(txt(bx + (bw - 12) / 2, H - pad.b + 16, d[0], { size: 9 }));
    });
    svg.appendChild(txt(W / 2, H - 6, 'predicted joy (xJ) per day — Sat = derby day', { size: 9, fill: cssVar('--faint') }));
    svg.appendChild(txt(0, 0, 'xJ', { transform: `translate(12 ${H / 2}) rotate(-90)` }));
    host.appendChild(svg);
  }

  // ---- 6. precision-recall curve ----
  function prcurve(host) {
    const W = 420, H = 280, pad = { l: 42, r: 16, t: 16, b: 34 };
    const svg = svgRoot(W, H);
    const sc = frame(svg, W, H, pad, [0, 1], [0, 1]);
    const pts = [[0, 1], [.2, .995], [.4, .99], [.6, .985], [.75, .975], [.85, .96], [.92, .93], [.969, .886], [.99, .78], [1, .62]]
      .map(p => [sc.x(p[0]), sc.y(p[1])]);
    svg.appendChild(path(pts, cssVar('--c0'), 2.6));
    // operating point at recall .969
    const ox = sc.x(.969), oy = sc.y(.886);
    svg.appendChild(el('line', { x1: ox, y1: oy, x2: ox, y2: H - pad.b, stroke: cssVar('--c3'), 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
    svg.appendChild(el('circle', { cx: ox, cy: oy, r: 4.5, fill: cssVar('--c3') }));
    svg.appendChild(txt(ox - 6, oy - 8, 'recall 96.9%', { anchor: 'end', fill: cssVar('--c3'), weight: 600, size: 9 }));
    svg.appendChild(txt(W / 2, H - 8, 'recall'));
    svg.appendChild(txt(0, 0, 'precision', { transform: `translate(12 ${H / 2}) rotate(-90)` }));
    svg.appendChild(txt(pad.l + 8, pad.t + 12, 'PR-AUC 0.975', { anchor: 'start', size: 9, fill: cssVar('--faint') }));
    host.appendChild(svg);
  }

  // ---- 7. confusion matrix heatmap ----
  function confusion(host) {
    const W = 360, H = 300, pad = { l: 70, t: 46 };
    const cell = 120;
    const svg = svgRoot(W, H);
    const data = [[186, 48], [12, 378]]; // [[TN,FP],[FN,TP]]
    const max = 378;
    const labels = [['True Neg', 'False Pos'], ['False Neg', 'True Pos']];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
      const v = data[r][c];
      const x = pad.l + c * cell, y = pad.t + r * cell;
      const isDiag = r === c;
      const base = isDiag ? cssVar('--c2') : cssVar('--c3');
      const op = 0.12 + 0.78 * (v / max);
      svg.appendChild(el('rect', { x, y, width: cell - 4, height: cell - 4, rx: 6, fill: base, opacity: op }));
      const t1 = txt(x + (cell - 4) / 2, y + (cell - 4) / 2 - 2, String(v), { size: 22, weight: 700, fill: cssVar('--ink') });
      svg.appendChild(t1);
      svg.appendChild(txt(x + (cell - 4) / 2, y + (cell - 4) / 2 + 18, labels[r][c], { size: 9, fill: cssVar('--muted') }));
    }
    // axis labels
    svg.appendChild(txt(pad.l + cell / 2, pad.t - 22, 'pred: NORMAL', { size: 9, fill: cssVar('--faint') }));
    svg.appendChild(txt(pad.l + cell + cell / 2, pad.t - 22, 'pred: PNEUMONIA', { size: 9, fill: cssVar('--faint') }));
    svg.appendChild(txt(0, 0, 'actual: NORMAL', { size: 9, fill: cssVar('--faint'), transform: `translate(${pad.l - 16} ${pad.t + cell / 2}) rotate(-90)` }));
    svg.appendChild(txt(0, 0, 'actual: PNEU.', { size: 9, fill: cssVar('--faint'), transform: `translate(${pad.l - 16} ${pad.t + cell + cell / 2}) rotate(-90)` }));
    host.appendChild(svg);
  }

  // ---- 8. model bake-off bars (MAPE, lower is better) ----
  function modelbars(host) {
    const W = 440, H = 280, pad = { l: 44, r: 16, t: 16, b: 50 };
    const svg = svgRoot(W, H);
    const sc = frame(svg, W, H, pad, [0, 4], [0, 10]);
    const data = [['Prophet', 9.0, '--c0'], ['XGBoost', 0.81, '--c2'], ['LSTM', 1.11, '--c0'], ['TFT', 5.53, '--c0']];
    const bw = (W - pad.l - pad.r) / 4;
    data.forEach((d, i) => {
      const bx = pad.l + i * bw + 12, by = sc.y(d[1]);
      svg.appendChild(el('rect', { x: bx, y: by, width: bw - 24, height: (H - pad.b) - by, rx: 3, fill: cssVar(d[2]), opacity: .9 }));
      svg.appendChild(txt(bx + (bw - 24) / 2, by - 6, d[1] + '%', { size: 9, weight: 600, fill: cssVar('--ink') }));
      svg.appendChild(txt(bx + (bw - 24) / 2, H - pad.b + 16, d[0], { size: 9 }));
    });
    svg.appendChild(txt(W / 2, H - 8, 'MAPE — lower is better · XGBoost wins', { size: 9, fill: cssVar('--faint') }));
    svg.appendChild(txt(0, 0, 'MAPE %', { transform: `translate(12 ${H / 2}) rotate(-90)` }));
    host.appendChild(svg);
  }

  // ---- 9. forecast: actual vs predicted over a week ----
  function forecast(host) {
    const W = 440, H = 280, pad = { l: 44, r: 16, t: 16, b: 34 };
    const svg = svgRoot(W, H);
    const sc = frame(svg, W, H, pad, [0, 168], [0, 1]);
    const actual = [], pred = [];
    for (let h = 0; h <= 168; h += 3) {
      const day = (h % 24) / 24;
      const base = 0.5 + 0.32 * Math.sin((day - 0.28) * 2 * Math.PI) + (h > 120 ? -0.08 : 0); // weekend dip
      const a = Math.max(0.08, base + 0.04 * Math.sin(h));
      actual.push([sc.x(h), sc.y(a)]);
      pred.push([sc.x(h), sc.y(a + (Math.random() - 0.5) * 0.025)]);
    }
    svg.appendChild(path(actual, cssVar('--faint'), 3));
    svg.appendChild(path(pred, cssVar('--c2'), 1.8));
    svg.appendChild(txt(W / 2, H - 8, 'hour of week →'));
    svg.appendChild(txt(0, 0, 'load (norm)', { transform: `translate(12 ${H / 2}) rotate(-90)` }));
    svg.appendChild(el('rect', { x: W - pad.r - 110, y: pad.t + 6, width: 14, height: 3, fill: cssVar('--faint') }));
    svg.appendChild(txt(W - pad.r - 92, pad.t + 12, 'actual', { anchor: 'start', size: 9 }));
    svg.appendChild(el('rect', { x: W - pad.r - 110, y: pad.t + 20, width: 14, height: 3, fill: cssVar('--c2') }));
    svg.appendChild(txt(W - pad.r - 92, pad.t + 26, 'XGBoost', { anchor: 'start', size: 9 }));
    host.appendChild(svg);
  }

  const REG = { calibration, equity, histogram, loss, week, prcurve, confusion, modelbars, forecast };

  window.renderCharts = function () {
    document.querySelectorAll('[data-chart]').forEach(host => {
      host.innerHTML = '';
      const fn = REG[host.getAttribute('data-chart')];
      if (fn) fn(host);
    });
  };

  if (document.readyState !== 'loading') window.renderCharts();
  else document.addEventListener('DOMContentLoaded', window.renderCharts);
})();
