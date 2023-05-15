import MersenneTwister from 'mersenne-twister';

// generate count random numbers from a hash within each respective range
function generateRandomNumbersFromHash(hash: string, count: number, ranges: number[]): number[] {
  if (ranges.length !== count) {
    throw new Error('ranges must be the same length as count');
  }

  // Convert the Kecccak hash to a numeric seed
  //TODO: verify that collisions are sufficiently rare, we can't map this to its corresponding
  // BigInt number because we can only provide numbers not BigInts to the Mersenne Twister. Also
  // with sufficiently large numbers the generated random numbers end up being the same. So
  // tl;dr we do this to get fairly unqiue deterministic seed for a given userId that is
  // within range to actually produce meaningful random numbers.
  const seed = Number(parseInt(hash, 16).toString().substring(0, 12)) * 1000000;

  // Create a Mersenne Twister PRNG instance with the seed
  const mt = new MersenneTwister(seed);

  const randomNumbers: number[] = [];
  for (let i = 0; i < count; i++) {
    // Generate a random number between 0 and 1
    const randomNumber = mt.random();
    const modifiedRandomNumber = Math.floor(randomNumber * ranges[i]);

    // Push the random number to the result array
    randomNumbers.push(modifiedRandomNumber);
  }

  return randomNumbers;
}

export function getSeedFromHash(hash: string, count: number, ranges: number[]) {
  const randomNumbers = generateRandomNumbersFromHash(hash, count, ranges);
  return {
    background: randomNumbers[0],
    body: randomNumbers[1],
    accessory: randomNumbers[2],
    head: randomNumbers[3],
    glasses: randomNumbers[4],
  };
}
