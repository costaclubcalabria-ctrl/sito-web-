# Modelli 3D

I file `.glb` dei prodotti vanno qui, con **lo stesso nome dello slug** in
`data/products.ts` (es. `vaso-onda.glb`).

Finché un file manca, la scena usa la geometria procedurale segnaposto definita
in `modello.segnaposto`: il sito non mostra mai un buco.

Pipeline completa di conversione, target di peso e convenzioni: **`MODELS.md`**
nella radice del progetto.

`draco/` è vuota di proposito: oggi si usa la compressione Meshopt, il cui
decoder è già dentro `three`. La cartella resta per il caso in cui serva Draco.
