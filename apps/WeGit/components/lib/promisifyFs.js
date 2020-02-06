// Imports
// =============================================================================

// Main
// =============================================================================

const promisify = (f, thisValue, manyArgs = false) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      const callback = (err, ...results) => {
        if (err) return reject(err);
        return resolve(manyArgs ? results : results[0]);
      };

      f.apply(thisValue, [...args, callback]);
    });
  };
};

export default fs =>
  Object.entries(fs).reduce((acc, [k, v]) => {
    if (typeof v !== 'function') return acc;
    return {
      ...acc,
      [k]: promisify(v, fs),
    };
  }, {});
