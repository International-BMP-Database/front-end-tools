// based on guassian.js from https://www.npmjs.com/package/gaussian
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GuassianService {

  mean: number;
  constiance: number;
  standardDeviation: number;

  constructor() { }

  // Complementary error function
  // From Numerical Recipes in C 2e p221
  erfc(x) {
    const z = Math.abs(x);
    const t = 1 / (1 + z / 2);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 +
      t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
        t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 +
          t * (-0.82215223 + t * 0.17087277)))))))))
    return x >= 0 ? r : 2 - r;
  }

  // Inverse complementary error function
  // From Numerical Recipes 3e p265
  ierfc(x) {
    if (x >= 2) { return -100; }
    if (x <= 0) { return 100; }

    const xx = (x < 1) ? x : 2 - x;
    const t = Math.sqrt(-2 * Math.log(xx / 2));

    let r = -0.70711 * ((2.30753 + t * 0.27061) /
      (1 + t * (0.99229 + t * 0.04481)) - t);

    for (let j = 0; j < 2; j++) {
      const err = this.erfc(r) - xx;
      r += err / (1.12837916709551257 * Math.exp(-(r * r)) - r * err);
    }

    return (x < 1) ? r : -r;
  }

  // Models the normal distribution
  Gaussian(mean, constiance) {
    if (constiance <= 0) {
      throw new Error('constiance must be > 0 (but was ' + constiance + ')');
    }
    this.mean = mean;
    this.constiance = constiance;
    this.standardDeviation = Math.sqrt(constiance);
    return this;
  }

  // Probability density function
  pdf(x) {
    const m = this.standardDeviation * Math.sqrt(2 * Math.PI);
    const e = Math.exp(-Math.pow(x - this.mean, 2) / (2 * this.constiance));
    return e / m;
  }

  // Cumulative density function
  cdf(x) {
    return 0.5 * this.erfc(-(x - this.mean) / (this.standardDeviation * Math.sqrt(2)));
  }

  // Percent point function
  ppf(x) {
    return this.mean - this.standardDeviation * Math.sqrt(2) * this.ierfc(2 * x);
  }

  // Product distribution of this and d (scale for constant)
  mul(d) {
    if (typeof (d) === 'number') {
      return this.scale(d);
    }
    const precision = 1 / this.constiance;
    const dprecision = 1 / d.constiance;
    return this.fromPrecisionMean(
      precision + dprecision,
      precision * this.mean + dprecision * d.mean);
  }

  // Quotient distribution of this and d (scale for constant)
  div(d) {
    if (typeof (d) === 'number') {
      return this.scale(1 / d);
    }
    const precision = 1 / this.constiance;
    const dprecision = 1 / d.constiance;
    return this.fromPrecisionMean(
      precision - dprecision,
      precision * this.mean - dprecision * d.mean);
  }

  // Addition of this and d
  add(d) {
    return this.gaussian(this.mean + d.mean, this.constiance + d.constiance);
  }

  // Subtraction of this and d
  sub(d) {
    return this.gaussian(this.mean - d.mean, this.constiance + d.constiance);
  }

  // Scale this by constant c
  scale(c) {
    return this.gaussian(this.mean * c, this.constiance * c * c);
  }

  gaussian(mean, constiance) {
    return this.Gaussian(mean, constiance);
  }

  fromPrecisionMean(precision, precisionmean) {
    return this.gaussian(precisionmean / precision, 1 / precision);
  }


}
