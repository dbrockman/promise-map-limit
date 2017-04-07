const mapLimit = require('..');

describe('with an async iteratee', () => {

  it('should resolve with the mapped array', () => {
    return mapLimit([1, 2, 3, 4], 2, n => Promise.resolve(n * 2)).then(array => {
      expect(array).toEqual([2, 4, 6, 8]);
    });
  });

});

describe('with a sync iteratee', () => {

  it('should resolve with the mapped array', () => {
    return mapLimit([1, 2, 3, 4], 2, n => n * 2).then(array => {
      expect(array).toEqual([2, 4, 6, 8]);
    });
  });

});

describe('when limit is smaller than the number of items', () => {

  it('should only work on max limit number of items at a time', () => {
    const history = [];
    const current = new Set();
    return mapLimit([9, 1, 8, 2, 3], 2, n => {
      current.add(n);
      expect(current.size).toBeLessThanOrEqual(2);
      history.push(`start ${n}: [${Array.from(current)}]`);
      return wait(n * 10).then(() => {
        current.delete(n);
        history.push(`done ${n}: [${Array.from(current)}]`);
        return n;
      })
    }).then(array => {
      expect(array).toEqual([9, 1, 8, 2, 3]);
      expect(history).toEqual([
        'start 9: [9]',
        'start 1: [9,1]',
        'done 1: [9]',
        'start 8: [9,8]',
        'done 9: [8]',
        'start 2: [8,2]',
        'done 8: [2]',
        'start 3: [2,3]',
        'done 2: [3]',
        'done 3: []',
      ]);
    });
  });

});

describe('when limit is greater than the number of items', () => {

  it('should resolve with the mapped array', () => {
    return mapLimit([1], 2, n => n).then(array => {
      expect(array).toEqual([1]);
    });
  });

});

describe('when the iterable is empty', () => {

  it('should resolve with an empty array', () => {
    return mapLimit([], 2, n => n).then(array => {
      expect(array).toEqual([]);
    });
  });

});

describe('when the iterable is a string', () => {

  it('should iterate each char', () => {
    return mapLimit('abc', 2, s => s.toUpperCase()).then(array => {
      expect(array).toEqual(['A', 'B', 'C']);
    });
  });

});

describe('when the iterable is a plain object', () => {

  it('should iterate each value', () => {
    return mapLimit({ a: 1, b: 2, c: 3 }, 2, n => n * 2).then(array => {
      expect(array).toEqual([2, 4, 6]);
    });
  });

});

describe('with the items do not finnish in order', () => {

  it('should resolve with an array in the correct order', () => {
    return mapLimit([1, 2, 3, 4], 2, n => {
      if (n === 2) {
        return wait(10).then(() => n * 2);
      }
      return n * 2;
    }).then(array => {
      expect(array).toEqual([2, 4, 6, 8]);
    });
  });

});

describe('when the iteratee function throws an error', () => {

  it('should reject with the error', () => {
    return mapLimit([1, 2, 3], 10, () => {
      throw new Error('test error');
    }).then(shouldReject, err => {
      expect(err.message).toBe('test error');
    });
  });

});

describe('when the iteratee function rejects', () => {

  it('should reject with the error', () => {
    return mapLimit([1, 2, 3], 10, () => Promise.reject(new Error('test error'))).then(shouldReject, err => {
      expect(err.message).toBe('test error');
    });
  });

});

describe('when the iteratee function is omitted', () => {

  it('should use the default iteratee that runs each function in the iterable', () => {
    return mapLimit([
      () => Promise.resolve('an async result'),
      () => 'a sync result',
    ], 2).then(array => {
      expect(array).toEqual(['an async result', 'a sync result']);
    });
  });

  describe('when one of the items is not a function', () => {

    it('should reject with an error', () => {
      return mapLimit([
        () => Promise.resolve('an async result'),
        'not a function',
        () => 'a sync result',
      ], 10).then(shouldReject, err => {
        expect(err.message).toBe('The default iterator in mapLimit expects an array of functions');
      });
    });

  });

  describe('when one of the functions throw', () => {

    it('should reject with the error', () => {
      return mapLimit([
        () => Promise.resolve('an async result'),
        () => {
          throw new Error('test error');
        },
        () => 'a sync result',
      ], 10).then(shouldReject, err => {
        expect(err.message).toBe('test error');
      });
    });

  });

  describe('when one of the functions reject', () => {

    it('should reject with the error', () => {
      return mapLimit([
        () => Promise.resolve('an async result'),
        () => Promise.reject(new Error('test error')),
        () => 'a sync result',
      ], 10).then(shouldReject, err => {
        expect(err.message).toBe('test error');
      });
    });

  });

  describe('when the iterable is empty', () => {

    it('should resolve with an empty array', () => {
      return mapLimit([], 2).then(array => {
        expect(array).toEqual([]);
      });
    });

  });

});

describe('when the iterable is omitted', () => {

  it('should resolve with an empty array', () => {
    return mapLimit(null, 1).then(array => {
      expect(array).toEqual([]);
    });
  });

});

describe('when the limit is invalid', () => {

  it('should throw an error if limit is not a number', () => {
    expect(() => mapLimit([], NaN)).toThrow(RangeError, 'limit must be a finite integer >= 1');
  });

  it('should throw an error if limit is not finite', () => {
    expect(() => mapLimit([], Infinity)).toThrow(RangeError, 'limit must be a finite integer >= 1');
  });

  it('should throw an error if limit is not an integer', () => {
    expect(() => mapLimit([], 3.5)).toThrow(RangeError, 'limit must be a finite integer >= 1');
  });

});


function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shouldReject() {
  throw new Error('Expected promise to reject');
}
