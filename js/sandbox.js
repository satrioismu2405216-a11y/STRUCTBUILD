  drawReactions() {
    const { supA, supB, reactionA_y, reactionB_y } = this.simulationResults;
    const drawReactionArrow = (node, rY) => {
      if (!node || rY <= 0) return;
      const arrowLen = Math.min(75, Math.max(30, (rY / 60) * 50));
      const startY = node.y + 40 + arrowLen;
      this.ctx.strokeStyle = '#10b981';
      this.ctx.fillStyle = '#10b981';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(node.x, startY);
      this.ctx.lineTo(node.x, node.y + 36);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(node.x, node.y + 30);
      this.ctx.lineTo(node.x - 8, node.y + 44);
      this.ctx.lineTo(node.x + 8, node.y + 44);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Reaksi Naik (R)', node.x, startY + 16);
    };
    if (supA) drawReactionArrow(supA, reactionA_y);
    if (supB) drawReactionArrow(supB, reactionB_y);
  }
}
window.StructureSandbox = StructureSandbox;
