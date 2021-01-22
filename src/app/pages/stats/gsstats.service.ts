import { Injectable } from '@angular/core';
// import * as summaryStatistics from 'summary-statistics';
import * as genstats from 'genstats';
import * as jerzy from 'jerzy';

@Injectable({
  providedIn: 'root'
})
export class GsstatsService {
  genStats;
  jerzyJS;
  constructor(
    // public genStats: genstats,
    // public jerzyJS: jerzy
  ) {

  }

  normalZ(z) {

    const x = z;
    const b = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429];
    let p = 0.2316419;
    const t = 1 / (1 + p * x);
    let fact = t;
    let sum = 0;
    for (let i = 0; i <= b.length - 1; i++) {
      sum += b[i] * fact;
      fact *= t;
    }
    p = 2 * sum * Math.exp(-x * x / 2.0) / (Math.sqrt(2 * Math.PI));
    return p;
  }


}
