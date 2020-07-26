import "../../../modules/tensorflow/tensorflow.js";

export default class hydro {
  /**
   * Computation of aereal mean precipitation for a river basin given it has 2 or more different stations.
   * @param {Object []} data - array object with precipitation with equal amounts of data from different rain gauges.
   * @returns {Object []} array - object with average precipitaiton for a specific time series.
   */

  static arithmetic(arr) {
    var average = [];
    var final = [];
    var n = arr.length;
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[0].length; j++) {
        average.push(arr[i][j]);
      }
    }
    for (var h = 0; h < average.length; h = +n) {
      var minarr = average.slice(h, h + n);
      final[h] = this.totalprec(minarr) / minarr.length;
      var filtered = final.filter(function (el) {
        return el != null;
      });
    }
    return filtered;
  }

  /**
   * Calculates average precipitation for a basin considering there is
   * one station per sub basin.
   * @param {Object} data - object describing the time series data and area per subbasin.
   * @returns {Object []} array - time series of average precipitation over a whole basin.
   */

  static thiessen(params) {
    var precs = params.rainfall;
    var areas = params.areas;
    var totarea = this.totalprec(areas);
    var res = this.matrix(precs.length, areas.length, 0);
    var out = this.matrix(1, precs[0].length, 0);

    for (var i = 0; i < precs.length; i++) {
      for (var j = 0; j < precs[0].length; j++) {
        res[i][j] = precs[i][j] * areas[i];
        out[j] = +res[i][j] / totarea;
      }
    }
    return out;
  }

  /**
   * Calculates parameters for the generation of a unit hydrograph
   * based on SCS method, Snyder Unit Hydrograph.
   * All times of concentrations and lags time are calculated in hours.
   * @param {Object} params - Specifications for calculations.
   * @returns {Object} calculations depending on type.
   * @example
   * params = {type: "SCS",unit: "si",
   * args: {L: 4000,slope: 10, cn: 82}}
   * returns = {MaxRetention: 2.1951219512195124, TimeConc: 0.4763041318819232, LagTime: 0.28578247912915394}
   */

  static syntheticalc(params) {
    //imports from parameters.
    var type = params.type;
    var lon = params.args.L;
    var sl = params.args.slope;
    var units = params.unit;

    //Varibles that are to be calculated as solutions.
    var tc, tp, lag;

    //Object containing the solutions for the request.
    var sol = new Object();

    if (type == "SCS") {
      var sc = 0;
      var CN = params.args.CN;

      switch (units) {
        //longitude in feet, tc in hours, sl in percentage, sc in inches.
        case "si":
          sc = 1000 / CN - 10;
          break;

        case "m":
          //longitude in meters, tc in hours, sl in percentage, sc in mm.
          sc = 25400 / CN - 254;
          break;

        default:
          alert("Please use a correct unit system!");
      }

      tc =
        (Math.pow(lon, 0.8) * Math.pow(sc + 1, 0.7)) /
        (1140 * Math.pow(sl, 0.5));
      tp = 0.7 * tc;
      lag = 0.6 * tc;
      Object.assign(sol, {
        MaxRetention: sc,
        TimeConc: tc,
        TimePeak: tp,
        LagTime: lag,
      });
    } else if (type == "kirpich") {
      var K = 0;
      switch (units) {
        case "si":
          //longitude in feet and sl as number.
          K = 0.0078;
          break;
        case "m":
          //longitude in meters and sl as number
          K = 0.0195;
          break;
        default:
          alert("Please use a correct unit system!");
      }
      tc = (K * Math.pow(lon, 0.77) * Math.pow(sl, -0.385)) / 60;
      tp = 0.7 * tc;
      lag = 0.6 * tc;
      Object.assign(sol, { TimeConc: tc, TimePeak: tp, LagTime: lag });
    } else if (type == "kerby") {
      var n = params.args.manning;

      switch (units) {
        // change calculations depending on units.
        case "si":
          tc = Math.pow((2.2 * n * lon) / Math.pow(sl / 100, 0.5), 0.324) / 60;
          break;
        case "m":
          tc =
            (1.4394 * Math.pow((n * lon) / Math.pow(sl / 100, 0.5), 0.467)) /
            60;
          break;
        default:
          alert("Please use a correct unit system!");
      }
      tp = 0.7 * tc;
      lag = 0.6 * tc;
      Object.assign(sol, { TimeConc: tc, LagTime: lag });
    }
    return sol;
  }

  /**
   * Creates a dimensionless unit hydrograph using the gamma distribution for calculating Q/Qp.
   * For selection of the peak rate factor, consider that a PRF of 100 is for less flat areas
   * while a PRF of 600 is for very steep terrain.
   * Adapted from from (NEH, 2007).
   * @param {Object} data - object specifying the type of distribution, time step to compute the hydrograph.
   * @returns {Object []} array - dimensionless hydrograph.
   */

  static dimunithydro(params) {
    //populate
    var step = params.timestep;
    var hours = params.numhours;

    //calculate the number of steps in the hydrograph
    var numstep = Math.round(hours / step) + 1;

    //create new vectors
    var ttp = Array(numstep).fill(0);
    var qqp = Array(numstep).fill(0);
    var m = 0;

    if ((params.distribution.type = "gamma")) {
      //change gamma shape factor.
      switch (params.distribution.PRF) {
        case 101:
          m = 0.26;
          break;
        case 238:
          m = 1;
          break;
        case 349:
          m = 2;
          break;
        case 433:
          m = 3;
          break;
        case 484:
          m = 3.7;
          break;
        case 504:
          m = 4;
          break;
        case 566:
          m = 5;
        default:
          alert("Please choose value between 101,238,349,433,484,504,566.");
      }

      //populating the array with t/tp relationship every 0.1t.
      //populating the array with q/qp using Gamma distribution with PRF value.
      for (var i = 1; i < ttp.length; i++) {
        ttp[i] = Number((ttp[i - 1] + step).toFixed(2));
        qqp[i] = Number(
          (Math.exp(m) * Math.pow(ttp[i], m) * Math.exp(-m * ttp[i])).toFixed(3)
        );
      }
      return [ttp, qqp];
    } else {
      alert("Please use available distributions!");
    }
  }

  /**
   * Unit hydrograph constructor NRCS constructor depending on the
   * physical characteristics of a regularly shaped basin. Adapted from (NEH, 2007).
   * @param {Object} data - object that specifies the physical characteristics and the type of
   * distribution required as well as the time step to compute the hydrograph.
   * @returns {Object []} array - time series array. If metric in m3/s, if SI in cfs.
   */

  static unithydrocons(params) {
    //import parameters from user.
    var area = params.drainagearea;
    var tconc = params.tconcentration;
    var duh = params.unithydro;
    var peak = params.peak;

    //calculate time step.
    var deltat = Number((tconc * 0.133).toFixed(3));

    //calculate time to peak and construct result arrays.
    var tp = deltat / 2 + 0.6 * tconc;
    var unit = this.matrix(2, duh[0].length, 0);
    var qp = 0;

    //change peak discharge depending on the units.
    switch (params.units) {
      case "si":
        qp = (484 * area * 1) / tp;
        break;
      case "m":
        qp = (0.208 * area * 1) / tp;
        break;
      default:
        alert("Please input a valid unit system!");
    }

    //populate the hydrograph with time and discharge.
    for (var h = 0; h < unit[0].length; h++) {
      unit[0][h] = Number((duh[0][h] * tp).toFixed(3));
      unit[1][h] = Number((duh[1][h] * qp).toFixed(3));
    }
    return unit;
  }

  /**
   * Flooding hydrograph generator using a Dimensionless Unit Hydrograph,
   * precipitation data and SCS metrics for runoff calculation.
   * Important: the type of the date must be compliant to Javascript types, in string format.
   * @param {Object} data - parameter object specifying landuse, rainfall, infiltration capacity and baseflow.
   * @returns {Object []} values for runoff as time series.
   */

  static floodhydro(params) {
    //import data from parameters.
    const rain = params.rainfall;
    const unit = params.unithydro;
    const cn = params.cn;
    const stormdur = params.stormduration;
    const timestep = params.timestep;

    //transform the date into javascript format.

    //create arrays for calculation of runoff
    var numarray = Math.round(stormdur / timestep);
    var finalcount = numarray + unit[0].length;
    var sc = 0;
    var accumrainf = this.matrix(2, rain[1].length, 0);
    accumrainf[0] = rain[0];
    var accumrunff = this.matrix(2, rain[1].length, 0);
    accumrunff[0] = rain[0];
    var incrementrunff = this.matrix(2, rain[1].length, 0);
    incrementrunff[0] = rain[0];
    var hydros = this.matrix(stormdur, finalcount, 0);
    var finalhydro = this.matrix(2, finalcount, 0);

    // change calculations depending on units.
    switch (params.units) {
      case "si":
        sc = 1000 / cn - 10;
        break;
      case "m":
        sc = 25400 / cn - 254;
        break;
      default:
        alert("Please use a correct unit system!");
    }

    //add accumulative rainfall and calculate initial abstraction.
    var iniabs = 0.2 * sc;
    rain[1]
      .slice()
      .reduce((prev, curr, i) => (accumrainf[1][i] = prev + curr), 0);

    //add runoff calculations.
    for (var i = 0; i < numarray; i++) {
      if (accumrainf[1][i] > 0) {
        accumrunff[1][i] =
          Math.pow(accumrainf[1][i] - iniabs, 2) /
          (accumrainf[1][i] - iniabs + sc);
      } else {
        accumrunff[1][i] = 0;
      }
      incrementrunff[1][i] = Number(
        (Math.abs(accumrunff[1][i] - accumrunff[1][i - 1]) || 0).toFixed(3)
      );
    }

    //create composite hydrograph.
    for (var j = 0; j < hydros[0].length; j++) {
      hydros[0][j] = Number(
        (incrementrunff[1][j] * unit[1][j] || 0).toFixed(3)
      );
      finalhydro[0][j] = Number(finalhydro[0][j] + timestep);
    }

    //populate the moving hydrographs
    for (var h = 1; h < hydros.length; h++) {
      for (var k = 0; k < hydros[0].length; k++) {
        hydros[h][k + h] = Number(hydros[0][k].toFixed(3));
        finalhydro[1][k] = Number(hydros[h][k].toFixed(3));
      }
    }

    //accumulate timespan for cumulative hydrograph.
    finalhydro[0]
      .slice()
      .reduce(
        (prev, curr, i) =>
          (finalhydro[0][i] = Number((prev + curr).toFixed(2), 0))
      );

    //
    return finalhydro;
  }

  /**
   * Simple rainfall-runoff analyses over a rainfall dataset given landuse, baseflow and infiltration capacity.
   * @param {Object} data - parameter object landuse, rainfall, infiltration capacity and baseflow.
   * @returns {Object []} array - values for runoff as time series.
   */

  static bucketmodel(params) {
    //initial parameters
    let rainfall = params.rainfall;
    let n = rainfall.length;
    let baseflow = params.baseflow / 24;
    let evapodata = params.evaporation.data;
    let landuse = [
      params.landuse.agriculture,
      params.landuse.barerock,
      params.landuse.grassland,
      params.landuse.forest,
      params.landuse.moorland,
    ];
    let infiltration = params.infiltration;
    //infiltration capacities for agriculture, bare rock, grassland, forest and
    //moorland, respectively.
    let FieldCaps = [5, 50, 25, 25, 5];

    //arrays and variables
    var initial = this.matrix(landuse.length, n, 0);
    var interflow = this.matrix(landuse.length, n, 0);
    var overflow = this.matrix(landuse.length, n, 0);
    var totalflow = this.matrix(landuse.length, n, 0);
    var totalrunoff = this.matrix(landuse.length, n, 0);

    // initial moisture
    for (var i = 0; i < FieldCaps.length; i++) {
      initial[i][0] = FieldCaps[i] * landuse[i] + rainfall[0] - evapodata[0];
    }

    //initial soil moisture
    for (var k = 0; k < FieldCaps.length; k++) {
      if (initial[k][0] > FieldCaps[k]) {
        overflow[k][0] = initial[k][0] - FieldCaps[k];
        initial[k][0] = FieldCaps[k];
      } else {
        overflow[k][0] = 0;
      }
      if (initial[k][0] > 0) {
        interflow[k][0] = initial[k][0] * infiltration;
      } else {
        interflow[k][0] = 0;
      }
    }

    //calculating overland and interflow
    for (var m = 0; m < FieldCaps.length; m++) {
      for (var p = 1; p < n; p++) {
        initial[m][p] =
          initial[m][p - 1] * (1 - infiltration) + rainfall[p] - evapodata[p];
        if (initial[m][p] > FieldCaps[m]) {
          overflow[m][p] = initial[m][p] - FieldCaps[m];
          initial[m][p] = 0;
        } else {
          overflow[m][p] = 0;
        }
        if (initial[m][p] > 0) {
          interflow[m][p] = initial[m][p] * infiltration;
        } else {
          interflow[m][p] = 0;
        }
      }
    }

    //calculating the total amount of flow from overflow, baseflow and interflow
    for (var j = 0; j < FieldCaps.length; j++) {
      for (var h = 0; h < n; h++) {
        totalflow[j][h] = overflow[j][h] + interflow[j][h] + baseflow;
      }
    }
    //calculating total runoff
    for (var q = 0; q < n; q++) {
      totalrunoff[q] =
        totalflow[0][q] * landuse[0] +
        totalflow[1][q] * landuse[1] +
        totalflow[2][q] * landuse[2] +
        totalflow[3][q] * landuse[3] +
        totalflow[4][q] * landuse[4];
    }
    return totalrunoff;
  }

  /**
   * solves 1d groundwater steady simulation using gaussian elimination.
   * Adapted from (Molkentin, 2019).
   * @param {Object} params - object system example.
   * @return {Object []} matrix - matrix solved.
   */

  static ground1d(params) {
    //pass data from params to variables.
    var length = params.length;
    var k = params.k;
    var nodes = params.nodes;
    var w0 = params.w0;
    var w1 = params.w1;

    var hL = params.hL;
    var q0 = params.q0;
    var qL = params.qL;

    var dx = length / (nodes - 1);

    //create a new equation system
    var matrix = this.matrix(nodes, nodes, 0);
    var vec_left = this.matrix(1, nodes, 0);
    var vec_right = this.matrix(1, nodes, 0);

    //equation system set up.
    var factor = k / dx;

    //initial boundary.
    matrix[0][0] = factor;
    matrix[0][1] = -factor;
    vec_right[0] = q0;

    //last boundary.
    var index = nodes - 1;
    matrix[index][index] = -factor;
    matrix[index][index - 1] = factor;
    vec_right[index] = qL;

    //calculate inner nodes using Runge-Kutta 1D.
    for (var i = 1; i < nodes - 1; i++) {
      var newfac = k / (dx * dx);
      matrix[i][i] = 2 * newfac;
      matrix[i][i - 1] = -1 * newfac;
      matrix[i][i + 1] = -1 * newfac;
      vec_right[i] = w0 + w1 * i * dx;
    }

    //solve equation system.
    this.equationsystemsolver(matrix, vec_left, vec_right);

    //calculate discharge in vec_right
    vec_right[0] = (-k * (vec_left[1] - vec_left[0])) / dx;

    for (var i = 1; i < nodes - 1; i++) {
      vec_right[i] = ((-k * (vec_left[i + 1] - vec_left[i - 1])) / dx) * 0.5;
    }

    vec_right[index] = (-k * (vec_left[index] - vec_left[index - 1])) / dx;

    return vec_left;
  }

  /**
   * Aggregates or dissaggregates rainfall data depending on what
   * the user requires. The date type must be a Javascript string.
   * @param {*} arr
   */

  static rainaggr(params) {
    var event = params.event;
    var agtype = params.agg.type;

    var datetr = this.matrix(event.length, event[1].length, 0);

    for (var i = 0; i < event[0].length; i++) {
      if (typeof event[0][0] == "string") {
        datetr[0][i] = Date.parse(event[0][i]);
      } else {
        datetr[0][i] = event[0][i];
      }
    }

    for (var j = 1; j < event.length; j++) {
      datetr[j] = event[j];
    }

    //time interval required by the user.
    var finagg = params.agg.interval;

    //change the datatypes of date.
    if (agtype == "aggregation") {
      //timestep and total duration in minutes.
      var time = Math.abs(datetr[0][0]);
      var timestep = Math.abs((datetr[0][0] - datetr[0][1]) / (60 * 1000));
      var lastval = Math.abs(
        (datetr[0][0] - datetr[0][datetr[0].length - 1]) / (60 * 1000)
      );

      //amount of steps required and length of each step.
      var count = Math.round(finagg / timestep);
      var narr = Math.round(lastval / finagg);

      //initialize time and data variables to be handled separately.
      var fintime = [];
      var findata = [];

      for (var j = 0; j < narr; j += count) {
        var minitime = datetr[0].slice(j, j + count);
        var minidata = datetr[1].slice(j, j + count);
        fintime.push(
          new Date(this.totalprec(minitime) - time).toLocaleTimeString()
        );
        findata.push(this.totalprec(minidata));
      }
      return [fintime, findata];
    } else if (agtype == "disaggregation") {
      var finagg = params.agg.interval;
    }
  }

  /***************************/
  /***** Helper functions ****/
  /***************************/

  /**
   * Arithmetic sum of the values inside an array.
   * @param {Object []} data - array with precipitation event.
   * @returns {number} total amount of precipitation during an event on a given station.
   */

  static totalprec(arr) {
    var sum = 0;
    var k = arr.length;
    while (--k >= 0) {
      sum += arr[k];
    }
    return sum;
  }

  /**
   * Moving arrays in unit hydographs.
   * @param {Object []} data - array that is to be pushed in subtitute array.
   * @param {number} location - index from in original array.
   * @param {number} location - index to in substitute array.
   */

  static move(array, from, to) {
    if (to === from) return array;

    var target = array[from];
    var increment = to < from ? -1 : 1;

    for (var k = from; k != to; k += increment) {
      array[k] = array[k + increment];
    }
    array[to] = target;
    return array;
  }

  /**
   * Creates a matrix of m x n dimensions filled with whatever
   * the user requires. For numerical calculations, fill it with 0s.
   * @param {number} m - columns of the matrix.
   * @param {number} n - rows of the matrix.
   * @param {number} d - filler for every element of the array.
   * @returns {Object []} matrix - m x n array.
   */

  static matrix(m, n, d) {
    if ((d = undefined)) {
      var mat = Array(m).map(() => Array(n));
    } else {
      var mat = Array(m)
        .fill(d)
        .map(() => Array(n).fill(d));
    }
    return mat;
  }

  /**
   * solves linear equations in the form Ax = b.
   * @param {Object []} vec_right - vector on right hand side.
   * @param {Object []} vec_left - vector on left hand side.
   * @param {Object []} matrix - matrix to be filled.
   * @returns {Object []} vec_left.
   */

  static equationsystemsolver(matrix, vec_left, vec_right) {
    var fMaxEl;
    var fAcc;
    var nodes = vec_left.length;

    for (k = 0; k < nodes; k++) {
      //search line with largest element.
      fMaxEl = Math.abs(matrix[k][k]);
      var m = k;

      for (var i = k + 1; i < nodes; i++) {
        if (Math.abs(fMaxEl) < Math.abs(matrix[i][k])) {
          fMaxEl = matrix[i][k];
          m = i;
        }
      }
      // permutation of base line (index k) and max element line (index m)
      if (m != k) {
        for (var i = k; i < nodes; i++) {
          fAcc = matrix[k][i];
          matrix[k][i] = matrox[m][i];
          matrix[m][i] = fAcc;
        }
        fAcc = vec_right[k];
        vec_right[k] = vec_right[m];
        vec_right[m] = fAcc;
      }
      if (Math.abs(matrix[k][k]) < 1e-10) {
        alert("Singular matrix" + k + " " + matrix[k][k]);
      }
      for (var j = k + 1; j < nodes; j++) {
        fAcc = -matrix[j][k] / matrix[k][k];
        for (var i = k; i < nodes; i++) {
          matrix[j][i] = matrix[j][i] + fAcc * matrix[k][i];
        }
        vec_right[j] = vec_right[j] + fAcc * vec_right[k];
      }
    }
    for (var k = nodes - 1; k >= 0; k--) {
      vec_left[k] = vec_right[k];

      for (var i = k + 1; i < nodes; i++) {
        vec_left[k] -= matrix[k][i] * vec_left[i];
      }
      vec_left[k] = vec_left[k] / matrix[k][k];
    }
  };

  /**********************************/
  /*** End of Helper functions **/
  /**********************************/
}
