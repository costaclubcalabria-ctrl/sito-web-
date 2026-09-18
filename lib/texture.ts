import * as THREE from 'three'

/**
 * La texture degli strati.
 *
 * È il dettaglio che mancava: un oggetto liscio non racconta di essere stato
 * stampato. Qui una mappa di rilievo con una **riga per strato** rende visibili
 * le linee di deposizione, e la luce radente (`StudioLights`) le accende.
 *
 * Non è una texture scaricata: è disegnata su una canvas alla prima apertura,
 * una volta sola, e condivisa da tutti i materiali. Costo di rete: zero.
 *
 * Il profilo di un singolo strato non è una riga: è un **cordone**. Chiaro al
 * centro dove il filamento è più spesso, scuro al bordo dove due passate si
 * incontrano. Una riga netta darebbe delle scanalature incise, che è l'opposto.
 */

let bump: THREE.CanvasTexture | null = null

/**
 * @param ripetizioni quante volte la trama si ripete sull'altezza del pezzo,
 *   cioè quanti strati si vedono. Non è il numero reale (un pezzo da 140 mm a
 *   0,16 mm ha 875 strati e a schermo sarebbero rumore): è il numero che si
 *   **legge** come stampato.
 */
export function texturaStrati(ripetizioni: number): THREE.Texture {
  if (!bump) {
    const h = 32
    const c = document.createElement('canvas')
    c.width = 4
    c.height = h
    const g = c.getContext('2d')

    if (g) {
      const grad = g.createLinearGradient(0, 0, 0, h)
      // Un cordone: valle, cresta, valle. Il bordo inferiore è più scuro perché
      // è lì che lo strato successivo si appoggia sul precedente.
      grad.addColorStop(0, '#6a6a6a')
      grad.addColorStop(0.18, '#c8c8c8')
      grad.addColorStop(0.5, '#ffffff')
      grad.addColorStop(0.82, '#c0c0c0')
      grad.addColorStop(1, '#5a5a5a')
      g.fillStyle = grad
      g.fillRect(0, 0, 4, h)
    }

    bump = new THREE.CanvasTexture(c)
    bump.wrapS = THREE.RepeatWrapping
    bump.wrapT = THREE.RepeatWrapping
    bump.colorSpace = THREE.NoColorSpace
  }

  // Ogni pezzo ha il proprio numero di strati, quindi la propria ripetizione:
  // la texture di base è condivisa, il clone porta solo i parametri.
  const t = bump.clone()
  t.needsUpdate = true
  t.repeat.set(1, ripetizioni)
  return t
}
