import "../../../modules/d3/d3.js";
import "../../../modules/tensorflow/tensorflow.js";

export default class stats {
  /**
   * Makes a deep copy of original data for further manipulation.
   * @param {Object}  data - original data.
   * @returns {Object} Deep copy of original data.
   * @example var copy = hydro1.analyze.stats.copydata(data)
   */
  static copydata(data) {
    var arr;
    var values;
    var keys;

    if (typeof data !== "object" || data === null) {
      return data;
    }

    arr = Array.isArray(data) ? [] : {};

    for (keys in data) {
      values = data[keys];

      arr[keys] = this.copydata(values);
    }

    return arr;
  }

  /**
   * Retrieves a 1D array with the data.
   * @param {Object[]} data - array object.
   * @returns {Object[]} Array object.
   * @example var copy = hydro1.analyze.stats.onearray(data)
   */
  static onearray(data) {
    var arr = [];
    arr.push(data[1]);
    return arr;
  }

  /**
   * Identifies gaps in data.
   * @param {Object[]} arr - array object with data.
   * @returns {number} Number of gaps in data.
   * @example var gaps = hydro1.analyze.stats.gapid(arr)
   */
  static datagaps(arr) {
    var or;
    var gap = 0;

    if (typeof arr[0] != "object") {
      or = this.copydata(arr);
    } else {
      or = this.copydata(arr[1]);
    }
    for (var i = 0; i < or.length; i++) {
      if (or[i] === undefined || Number.isNaN(or[i]) || or[i] === false) {
        gap++;
      }
    }

    return console.log(`Total amount of gaps in data: ${gap}.`);
  }

  /**
   * Remove gaps in data with an option to fill the gap.
   * @param {Object[]} arr - array object with data.
   * @returns {number} Number of gaps found in the data.
   * @example var freeofgaps = hydro1.analyze.stats.gapremoval(arr)
   */
  static gapremoval(arr) {
    var or = this.copydata(arr);
    var val;

    if (typeof or[0] != "object") {
      val = this.cleaner(or);
    } else {
      var time = or[0];
      var ds = or[1];
      for (var i = 0; i < ds.length; i++) {
        if (ds[i] === undefined || Number.isNaN(ds[i]) || ds[i] === false) {
          delete time[i];
        }
      }
      val = this.cleaner(ds);
      time = this.cleaner(time);
      return [time, val];
    }
  }

  /**
   * Identifies gaps in time. Used for filling gaps if required by the
   * user. Time in minutes and timestep must be divisible by the total time of the event.
   * @param {Object[]} arr - time array.
   * @param {number} timestep - timestep of the data.
   * @returns {Object[]} array with gaps.
   */
  static timegaps(arr, timestep) {
    var or = this.copydata(arr);

    if (typeof arr[0] === "object") {
      or = this.copydata(arr[0]);
    }
    var datetr = [];

    for (var i = 0; i < or.length; i++) {
      if (typeof or[0] == "string") {
        datetr.push(Math.abs(Date.parse(or[i]) / (60 * 1000)));
      } else {
        datetr.push(or[i]);
      }
    }

    var gaps = 0;
    var loc = [];

    //timestep and total duration in minutes.
    var time = timestep;
    for (var i = 1; i < or.length - 1; i++) {
      if (
        Math.abs(datetr[i - 1] - datetr[i]) != time ||
        Math.abs(datetr[i] - datetr[i + 1]) != time
      ) {
        gaps++;
        loc.push(or[i]);
      }
    }

    if (loc.length === 0) {
      console.log("No gaps in times!");
      return;
    } else {
      console.log(`Number of time gaps: ${gaps}`);
      return loc;
    }
  }

  /**
   * Fills data gaps (either time missig or data missing).
   * @param {Object[]} arr - data with gaps to be filled.
   * @param {string} type - 'time' or 'data'.
   * @returns {Object[]} array with gaps filled.
   */
  static gapfiller(arr, type) {
    var or = this.copydata(arr);

    if (typeof arr[0] === "object") {
      or = this.copydata(arr[0]);
    }

    var datetr = [];

    for (var i = 0; i < or.length; i++) {
      if (typeof or[0] == "string") {
        datetr.push(Math.abs(Date.parse(or[i]) / (60 * 1000)));
      } else {
        datetr.push(or[i]);
      }
    }

    if (type === "time") {
    }
  }

  /**
   * Sums all data in a series.
   * @param {Object[]} data - array object with data.
   * @returns {number} Sum of all data in an array.
   */
  static sum(arr) {
    var sum = d3.sum(arr);
    return sum;
  }

  /**
   * Calculates the mean of a 1d array.
   * @param {Object[]} data - array object with data.
   * @returns {number} Mean of the data.
   */
  static mean(arr) {
    var m = d3.mean(arr);
    return m;
  }

  /**
   * Calculates the median values for a 1d array.
   * @param {Object[]} data - array object with data.
   * @returns {number} Median of the data.
   */
  static median(arr) {
    var m = d3.median(arr);
    return m;
  }

  /**
   * Calculates standard deviation of an array.
   * @param {Object[]} data - array object with data.
   * @returns {number} Standard deviation.
   */
  static stddev(arr) {
    var mean = this.mean(arr);
    var SD = 0;
    var nex = [];
    for (var i = 0; i < arr.length; i += 1) {
      nex.push((arr[i] - mean) * (arr[i] - mean));
    }
    return (SD = Math.sqrt(this.sum(nex) / nex.length));
  }

  /**
   * Calculate variance for an array of data.
   * @param {Object[]} data - array object with data.
   * @returns {number} Variance of the data.
   */
  static variance(arr) {
    var vari = d3.variance(arr);
    return vari;
  }

  /**
   * Calculates sum of squares for a dataset.
   * @param {Object[]} data - array object with data.
   * @returns {number} Sum of squares for data.
   */
  static sumsqrd(arr) {
    var sum = 0;
    var i = arr.length;
    while (--i >= 0) sum += arr[i];
    return sum;
  }

  /**
   * Minimum value of an array
   * @param {Object[]} data - array object with data.
   * @returns {number} Minimum value of a dataset.
   */
  static min(arr) {
    var low = d3.min(arr);
    return low;
  }

  /**
   * Maximum value of an array.
   * @param {Object[]} data - array object with data.
   * @returns {number} Maximum value of a dataset.
   */
  static max(arr) {
    var high = arr[0];
    var i = 0;
    while (++i < arr.length) if (arr[i] > high) high = arr[i];
    return high;
  }

  /**
   * Unique values in an array.
   * @param {Object[]} data - array object with data.
   * @returns {Object[]} Array with unique values.
   */
  static unique(arr) {
    var un = {},
      _arr = [];
    for (var i = 0; i < arr.length; i++) {
      if (!un[arr[i]]) {
        un[arr[i]] = true;
        _arr.push(arr[i]);
      }
    }
    return _arr;
  }

  /**
   * Calculates the frequency in data.
   * @param {Object[]} arr - data to be analyzed.
   * @returns {Object} Object with frenquency distribution.
   */

  static frequency(arr) {
    var _arr = this.copydata(arr);
    var counter = {};
    _arr.forEach((i) => {
      counter[i] = (counter[i] || 0) + 1;
    });
    return counter;
  }

  /**
   * Use mean and standard deviation to standardize the original dataset.
   * @param {Object[]} data - array object with data.
   * @returns {Object[]} Array with standardized data.
   */
  static standardize(arr) {
    var _arr = [];
    var stddev = this.stddev(arr);
    var mean = this.mean(arr);
    for (var i = 0; i < arr.length; i++) {
      _arr[i] = (arr[i] - mean) / stddev;
    }
    return _arr;
  }

  /**
   * Quantile calculator for given data.
   * @param {Object[]} data - array object with data.
   * @param {number} q - percentage of quantile required (ie. 0.25, 0.75).
   * @returns {Object[]} Array with values fitting the quartile.
   */
  static quantile(arr, q) {
    var _arr = arr.slice();
    _arr.sort(function (a, b) {
      return a - b;
    });
    var p = (arr.length - 1) * q;
    if (p % 1 === 0) {
      return _arr[p];
    } else {
      var b = Math.floor(p);
      var rest = p - b;
      if (_arr[b + 1] !== undefined) {
        return _arr[b] + rest * (_arr[b + 1] - _arr[b]);
      } else {
        return _arr[b];
      }
    }
  }

  /**
   * Identify the outliers on a dataset using interquartile range.
   * @param {Object[]} data - array object with data.
   * @param {number} q1 - first quartile. If not given as parameter, q1 = 0.25.
   * @param {number} q2 - second quartile. If not given as parameter, q2 = 0.75.
   * @returns {Object[]} Array with outliers.
   */
  static interoutliers(arr, q1, q2) {
    if (!(q1 || q2)) {
      q1 = 0.25;
      q2 = 0.75;
    }

    var or = this.copydata(arr);
    var time = [];

    switch (typeof arr[0]) {
      case "object":
        time = this.copydata(arr[0]);
        or = this.copydata(arr[1]);
        break;
      default:
        break;
    }

    var Q_1 = this.quantile(or, q1);
    var Q_2 = this.quantile(or, q2);
    var IQR = Math.abs(Q_2 - Q_1);

    var qd = Math.abs(Q_1 - 1.5 * IQR);
    var qu = Math.abs(Q_2 + 1.5 * IQR);

    var xa = (arra) => arra.filter((x) => x >= qd || x >= qu);
    var re = xa(or);

    if (typeof arr[0] != "object") {
      return re;
    } else {
      var t = [];
      for (var j = 0; j < or.length; j++) {
        if (or[j] >= qd || or[j] >= qu) {
          t.push(time[j]);
        }
      }
      return [t, re];
    }
  }

  /**
   * Identifies outliers in dataset by normalizing the data given two thresholds.
   * @param {Object[]} arr - array with data.
   * @param {number} low - lowest value range to consider. If not included as parameter, low = -0.5.
   * @param {number} high - ighest value range to consider. If not included as parameter, high = 0.5
   * @returns {Object[]} arr - array with outliers.
   */
  static normoutliers(arr, low, high) {
    if (!(low || high)) {
      low = -0.5;
      high = 0.5;
    }

    var or = this.copydata(arr);
    var time = [];

    switch (typeof arr[0]) {
      case "object":
        time = this.copydata(arr[0]);
        or = this.copydata(arr[1]);
        break;
      default:
        break;
    }

    var t1 = low;
    var t2 = high;

    var out = [];
    var stnd = this.standardize(or);

    for (var i = 0; i < or.length; i++) {
      if (stnd[i] < t1 || stnd[i] > t2) {
        out.push(or[i]);
      }
    }

    if (typeof arr[0] != "object") {
      return out;
    } else {
      var t = [];
      for (var j = 0; j < stnd.length; j++) {
        if (stnd[j] < t1 || stnd[j] > t2) {
          t.push(time[j]);
        }
      }
      return [t, out];
    }
  }

  /**
   * Remove outliers from dataset.
   * @param {Object[]} data - array object with data.
   * @param {string} type - outlier type: 'normalized' or 'interquartile'.
   * @param {number} p1 - low end parameter, depending on outlier analysis type.
   * @param {number} p2 - high end parameter, depending on outlier analysis type.
   * @returns {Object[]} Array with cleaned data.
   * @example var c = hydro1.analyze.stats.outremove(arr, 'interquartile')
   */
  static outremove(arr, type, p1, p2) {
    var out;

    if (type === "normalized") {
      out = this.normoutliers(arr, p1, p2);
    } else {
      out = this.interoutliers(arr, p1, p2);
    }

    if (typeof arr[0] != "object") {
      return this.itemfilter(arr, out);
    } else {
      var t = this.itemfilter(arr[0], out[0]);
      var or = this.itemfilter(arr[1], out[1]);

      return [t, or];
    }
  }

  /**
   * Calculates pearson coefficient for bivariate analysis.
   * @param {Object} param - object containing the datasets to be compared.
   * @returns {number} Pearson coefficient.
   */
  static correlation(params) {
    var q1 = params["Set1"];
    var q2 = params["Set2"];
    var n = q1.length + q2.length;
    var q1q2 = [];
    var sq1 = [];
    var sq2 = [];
    for (var i = 0; i < q1.length; i++) {
      q1q2[i] = q1[i] * q2[i];
      sq1[i] = q1[i] * q1[i];
      sq2[i] = q2[i] * q2[i];
    }
    var r1 = n * this.sum(q1q2) - this.sum(q1) * this.sum(q2);
    var r2a = Math.sqrt(n * this.sum(sq1) - Math.pow(this.sum(q1), 2));
    var r2b = Math.sqrt(n * this.sum(sq2) - Math.pow(this.sum(q2), 2));
    return r1 / (r2a * r2b);
  }

  /**
   * using tensorflow, it creates a fast fourier analysis over
   * a dataset and see if there are any patterns within the data.
   * @param {Object[]} arr - array with data.
   * @returns {Object[]} calculated array.
   */
  static fastfourier(arr) {
    tf.setBackend("webgl");
    const _arr = arr;
    const results = _arr.map((n) => {
      const tensors = [];
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        const real = tf.ones([10, n * 10]);
        const imag = tf.ones([10, n * 10]);
        const input = tf.complex(real, imag);
        const res = tf.spectral.fft(input);
        res.dataSync();
      }
      return performance.now() - start;
    });
    return results;
  }

  /**
   * Returns an array that contains the basic statistics
   * of a dataset. It is used afterwards to be prompted
   * using google graphing tools.
   * @param {Object[]} array - array with data.
   * @returns {Object[]} flatenned array for the dataset.
   */

  static basicstats(arr) {
    //call the basic functions for analysis.
    var min = this.min(arr);
    var max = this.max(arr);
    var sum = this.sum(arr);
    var mean = this.mean(arr);
    var median = this.median(arr);
    var std = this.stddev(arr);
    var vari = this.variance(arr);

    var statparams = [
      ["Minimum value", min],
      ["Maximum", max],
      ["Sum", sum],
      ["Mean", mean],
      ["Median", median],
      ["Standard deviation", std],
      ["Variance", vari],
    ];

    var ex1 = {
      graphdata: statparams,
      Columns: ["Metric", "Value"],
    };

    //flatenise the data for graphing.
    var statx = this.flatenise(ex1);

    return statx;
  }

  /***************************/
  /***** Helper functions ****/
  /***************************/

  /**
   * Preprocessing tool for joining arrays for table display.
   * @param {Object[]} data - array object to join.
   * @returns {Object[]} Array for table display.
   */
  static joinarray(arr) {
    var temp = [];
    for (var i = 1; i < arr[0].length; i++) {
      if (!temp[i]) {
        temp[i] = [];
      }
      temp[i] = [arr[0], arr[1]].reduce((a, b) => a.map((v, i) => v + b[i]));
    }
    return temp;
  }

  /**
   * Helper function for preparing arrays for charts and tables for duration/discharge.
   * @param {Object []} data - array object required to be flatenned.
   * @returns {Object []} Flatenned array.
   */

  static flatenise(params) {
    var x = params.Columns;
    var d = params.graphdata;
    var col = [];
    var data = [];
    for (var i = 0; i < x.length; i++) {
      col.push(x[i]);
    }
    for (var j = 0; j < d.length; j++) {
      data.push(d[j].flat());
    }
    return [col, data];
  }

  /**
   * Turns data from numbers to strings. Usable when
   * retrieving data or uploading data.
   * @param {Object[]} array - data composed of strings.
   * @returns {Object[]} array as numbers.
   * @example var c = hydro1.analyze.stats.numerise(arr)
   */

  static numerise(arr) {
    var result = arr.map((x) => parseFloat(x));
    return result;
  }

  /**
   * Filters out items in an array that are undefined, NaN, null, ", etc.
   * @param {Object[]} array - data to be cleaned.
   * @returns {Object[]} cleaned array.
   * @example var c
   */

  static cleaner(arr) {
    var x = arr.filter((x) => x === undefined || !Number.isNaN(x));
    return x;
  }

  /**
   * Filters out items in an array based on another array.
   * @param {Object[]} arr1 - array with data to be kept.
   * @param {Object[]} arr2 - array with data to be removed.
   * @returns {Object[]} cleaned array.
   */

  static itemfilter(arr1, arr2) {
    var x = arr1.filter((el) => !arr2.includes(el));
    return x;
  }

  /**
   * Changes a date array into local strings. Used mainly
   * for changing displaying into google charts.
   * @param {Object[]} array - data.
   * @returns {Object[]} array with date parsed.
   * @example var c = hydro1.analyze.stats.dateparser(arr)
   *
   */

  static dateparser(arr) {
    var x = this.copydata(arr);
    var xo = [];
    for (var j = 0; j < arr.length; j++) {
      xo.push(new Date(arr[j]).toLocaleString());
    }
    return xo;
  }

  /**
   * Changes a m x n matrix into a n x m matrix (transpose).
   * Mainly used for creating google charts. M =! N.
   * @param {Object[]} array - m x n matrix.
   * @returns {Object[]} array - n x m matrix.
   * @example var c = hydro1.analyze.stats.arrchange(arr)
   */

  static arrchange(arr) {
    var x = this.copydata(arr);
    var transp = (matrix) => matrix[0].map((x, i) => matrix.map((x) => x[i]));
    return transp(x);
  }

  /**********************************/
  /*** End of Helper functions **/
  /**********************************/
}
