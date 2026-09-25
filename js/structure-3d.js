  setSpanLength(lengthMeter) {
    this.beamLength = Math.max(4, Math.min(14, lengthMeter));
    this.loads.forEach(l => {
      if (l.pos > this.beamLength - 0.5) l.pos = this.beamLength / 2;
    });
    this.buildStructures();
  }
  resetView() {
    if (this.controls) {
      this.controls.reset();
      this.camera.position.set(0, 4.8, 11.5);
      this.controls.target.set(0, 1.4, 0);
    }
  }
  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
window.Structure3DViewer = Structure3DViewer;
