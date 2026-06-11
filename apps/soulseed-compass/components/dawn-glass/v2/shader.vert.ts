// MorphogenicMembrane vertex shader (S91) — fullscreen triangle pair.
// Ported from docs/dawn-glass-v0.2-material-physics.html <script id="vs">.
export const VERTEX_SHADER = `
  attribute vec2 p;
  void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;
