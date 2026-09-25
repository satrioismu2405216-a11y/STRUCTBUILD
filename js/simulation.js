          </div>
        </div>
      `;
    } else {
      feedbackBox.className = 'feedback-box attention show';
      feedbackBox.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:8px;">
          <span style="font-size:1.3rem;">🔍</span>
          <div>
            <strong>Periksa Kembali Distribusi Beban!</strong><br>
            Amati kembali tinggi panah reaksi hijau di atas tumpuan A dan B. Posisi resultan beban saat ini menyebabkan tumpuan 
            <strong>${RA > RB ? 'A' : (RB > RA ? 'B' : 'keduanya')}</strong> menerima porsi lebih besar.
          </div>
        </div>
      `;
    }
  }
  resetSimulation() {
    if (this.viewer3D) {
      this.viewer3D.loads = [
        { id: 1, pos: 3.0, mag: 50.0, meshGroup: null, color: 0xf59e0b, name: 'P1' }
      ];
      this.viewer3D.activeLoadId = 1;
      this.viewer3D.buildStructures();
      this.viewer3D.resetView();
    }
    this.syncLoadListUI();
    this.updateHUD();
    this.goToStep(1);
  }
}
window.SimulationController = SimulationController;
