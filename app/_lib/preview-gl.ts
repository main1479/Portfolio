// Raw-WebGL renderer behind the cursor-following work preview: a single quad
// whose texture ripples and RGB-splits with cursor velocity and melts between
// covers via noise-warped mixing. No three.js/ogl — the surface is one quad,
// a library would be bloat. Caller falls back to DOM crossfade when this
// returns null (no WebGL context).

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uMix;
uniform float uTime;
uniform vec2 uVel;
uniform float uRatioA;
uniform float uRatioB;

vec2 coverUv(vec2 uv, float ratio) {
  vec2 s = ratio > 1.0 ? vec2(1.0 / ratio, 1.0) : vec2(1.0, ratio);
  return (uv - 0.5) * s + 0.5;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec3 sampleSplit(sampler2D tex, vec2 uv, float ratio, vec2 shift) {
  vec2 cuv = coverUv(uv, ratio);
  return vec3(
    texture2D(tex, cuv + shift).r,
    texture2D(tex, cuv).g,
    texture2D(tex, cuv - shift).b
  );
}

void main() {
  vec2 uv = vUv;
  float vmag = min(length(uVel), 1.0);

  // Hand-speed ripple.
  uv += vec2(
    sin(uv.y * 9.0 + uTime * 2.4),
    sin(uv.x * 7.0 + uTime * 2.0)
  ) * 0.018 * vmag;

  // Noise-warped melt between covers.
  float n = vnoise(uv * 6.0 + uTime * 0.4);
  vec2 uvA = uv + vec2((n - 0.5) * uMix * 0.28);
  vec2 uvB = uv + vec2((n - 0.5) * (1.0 - uMix) * 0.28);

  vec2 shift = uVel * 0.012;
  vec3 colA = sampleSplit(uTexA, uvA, uRatioA, shift);
  vec3 colB = sampleSplit(uTexB, uvB, uRatioB, shift);

  gl_FragColor = vec4(mix(colA, colB, uMix), 1.0);
}
`;

export type PreviewGL = {
  setActive(index: number): void;
  setVelocity(vx: number, vy: number): void;
  start(): void;
  stop(): void;
  destroy(): void;
};

type TexEntry = { texture: WebGLTexture; aspect: number };

export function createPreviewGL(
  canvas: HTMLCanvasElement,
  urls: readonly string[],
): PreviewGL | null {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vs || !fs || !program) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    if (program) gl.deleteProgram(program);
    return null;
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  gl.useProgram(program);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {
    texA: gl.getUniformLocation(program, 'uTexA'),
    texB: gl.getUniformLocation(program, 'uTexB'),
    mix: gl.getUniformLocation(program, 'uMix'),
    time: gl.getUniformLocation(program, 'uTime'),
    vel: gl.getUniformLocation(program, 'uVel'),
    ratioA: gl.getUniformLocation(program, 'uRatioA'),
    ratioB: gl.getUniformLocation(program, 'uRatioB'),
  };
  gl.uniform1i(u.texA, 0);
  gl.uniform1i(u.texB, 1);

  // 1×1 placeholder so the first frames before a cover decodes aren't garbage.
  const blank = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, blank);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([227, 220, 212, 255]),
  );

  const textures = new Map<number, TexEntry>();
  const loading = new Set<number>();
  // Permanently failed URLs — without this a broken cover would re-fetch on
  // every hover.
  const failed = new Set<number>();

  const loadTexture = (index: number) => {
    if (textures.has(index) || loading.has(index) || failed.has(index) || !urls[index]) return;
    loading.add(index);
    const img = new Image();
    img.onload = () => {
      loading.delete(index);
      if (destroyed) return;
      const texture = gl.createTexture();
      if (!texture) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      // Non-power-of-two safe: clamp + linear, no mipmaps.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      textures.set(index, { texture, aspect: img.naturalWidth / img.naturalHeight });
    };
    img.onerror = () => {
      loading.delete(index);
      failed.add(index);
    };
    img.src = urls[index];
  };

  let texA = -1;
  let texB = -1;
  let mix = 0;
  let mixTarget = 0;
  const vel = { x: 0, y: 0 };
  const velTarget = { x: 0, y: 0 };
  let time = 0;
  let last = 0;
  let raf = 0;
  let running = false;
  let destroyed = false;

  const planeAspect = () => canvas.clientWidth / Math.max(1, canvas.clientHeight);

  const bind = (unit: number, index: number, ratioLoc: WebGLUniformLocation | null) => {
    const entry = textures.get(index);
    gl.activeTexture(unit);
    gl.bindTexture(gl.TEXTURE_2D, entry ? entry.texture : blank);
    gl.uniform1f(ratioLoc, entry ? entry.aspect / planeAspect() : 1);
  };

  const frame = (now: number) => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    time += dt;

    // Smooth the cursor velocity into the shader; let it bleed off when idle.
    vel.x += (velTarget.x - vel.x) * 0.12;
    vel.y += (velTarget.y - vel.y) * 0.12;
    velTarget.x *= 0.82;
    velTarget.y *= 0.82;
    mix += (mixTarget - mix) * 0.085;
    if (mixTarget === 1 && mix > 0.995) {
      texA = texB;
      mix = 0;
      mixTarget = 0;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);

    bind(gl.TEXTURE0, texA, u.ratioA);
    bind(gl.TEXTURE1, texB === -1 ? texA : texB, u.ratioB);
    gl.uniform1f(u.mix, mix);
    gl.uniform1f(u.time, time);
    gl.uniform2f(u.vel, vel.x, vel.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  return {
    setActive(index: number) {
      loadTexture(index);
      // Warm the neighbours so the next swap has its texture ready.
      loadTexture(index + 1);
      loadTexture(index - 1);
      if (texA === -1) {
        texA = index;
        return;
      }
      if (index === texA && mixTarget === 0) return;
      // Interrupted mid-melt: snap to the destination, then melt onward.
      if (mixTarget === 1) {
        texA = texB;
        mix = 0;
      }
      texB = index;
      mixTarget = 1;
    },
    setVelocity(vx: number, vy: number) {
      velTarget.x = Math.max(-1, Math.min(1, vx * 0.04));
      velTarget.y = Math.max(-1, Math.min(1, vy * 0.04));
    },
    start() {
      if (running || destroyed) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    destroy() {
      destroyed = true;
      running = false;
      cancelAnimationFrame(raf);
      textures.forEach((entry) => gl.deleteTexture(entry.texture));
      textures.clear();
      gl.deleteTexture(blank);
      gl.deleteBuffer(quad);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
