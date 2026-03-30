export class ShaderManager {
  constructor() {
    this.shaders = {};
  }

  async load(name, vertexPath, fragmentPath) {
    name = name.toLowerCase();
    const [vertex, fragment] = await Promise.all([
      fetch(vertexPath).then((r) => {
        if (!r.ok) throw new Error(`Vertex shader not found: ${vertexPath}`);
        return r.text();
      }),
      fetch(fragmentPath).then((r) => {
        if (!r.ok)
          throw new Error(`Fragment shader not found: ${fragmentPath}`);
        return r.text();
      }),
    ]);

    this.shaders[name] = { vertex, fragment };
  }

  get(name) {
    return this.shaders[name.toLowerCase()];
  }
}
