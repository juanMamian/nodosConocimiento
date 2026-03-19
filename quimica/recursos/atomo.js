class Atomo {
static getNumerosNeutronesAproximados(Z) {
		console.log("estimando");
  const results = [];

  // Estimate center of stability (valley of stability)
  const N0 = Math.round(Z * (1 + 0.015 * Math.pow(Z, 2/3)));

  // Estimate width of valid band
  const width = Math.round(0.6 * Z + 5);

  const Nmin = Math.max(0, N0 - width);
  const Nmax = N0 + width;

  for (let N = Nmin; N <= Nmax; N++) {
    // crude filter: avoid extremely unbalanced nuclei
    const ratio = N / Z;

    if (ratio > 0.5 && ratio < 2.0) {
      results.push(N);
    }
  }

  return results;
}
}
