// MorphogenicMembrane fragment shader (S91) — TIER 3 of the Dawn Glass v0.2
// material physics. Ported from docs/dawn-glass-v0.2-material-physics.html
// <script id="fs">, byte-identical EXCEPT the spec §10D golden-hour tuning:
// positional base gradient (cool blue top-right / warm sunrise pink bottom-
// left), warm-zone-strengthened caustics, and the cool iridescence hue shift.
// Brooks's reference is the canonical mood; further deviations get walked first.
export const FRAGMENT_SHADER = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_speed;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 a0 = x - floor(x + 0.5);
      vec3 g = a0 * vec3(x0.x, x12.xz) + h * vec3(x0.y, x12.yw);
      return 130.0 * dot(m, g);
  }

  void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float t = u_time * u_speed;

      // Nested domain warping for biological morphology
      vec2 q = vec2( snoise(uv + vec2(t, 0.0)), snoise(uv + vec2(5.2, 1.3)) );
      vec2 r = vec2( snoise(uv + 4.0*q + vec2(1.7, 9.2)), snoise(uv + 4.0*q + vec2(8.3, 2.8)) );
      float f = snoise(uv + 4.0*r);

      // §10D — Golden-hour positional gradient (canon mood from Logo 2)
      vec3 baseTopRight = vec3(0.92, 0.94, 1.00);   // cool morning blue
      vec3 baseBotLeft  = vec3(1.00, 0.92, 0.86);   // warm sunrise pink
      vec3 col = mix(baseBotLeft, baseTopRight, uv.x * 0.5 + uv.y * 0.5);

      // §10D — Structural iridescence with cool hue shift
      vec3 prism = 0.5 + 0.5*cos(6.28*(uv.xyx + vec3(0.0, 1.8, 4.2) + f));
      col = mix(col, prism, clamp(f*0.18, 0.0, 0.22));

      // §10D — Volumetric glisten / caustics, strengthened in warm zone
      float warmZone = clamp(1.0 - (uv.x + uv.y) * 0.5, 0.0, 1.0);
      float caust = pow(max(0.0, snoise(uv * 10.0 + r)), 10.0);
      col += caust * vec3(1.0, 0.85, 0.55) * (0.35 + warmZone * 0.25);

      gl_FragColor = vec4(col, 1.0);
  }
`;
