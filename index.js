var fs = require('fs');
var util = require('./util');

var filename = process.env.JEST_REPORT_JSON || 'report.json';

var output = {
  stats: {},
  failures: [],
  passes: [],
  skipped: [],
};

module.exports = function reporter(results) {
  output.stats.skipped = 0;
  output.stats.pending = 0;
  output.stats.tests = results.numTotalTests;
  output.stats.passes = results.numPassedTests;
  output.stats.failures = results.numFailedTests;
  output.stats.testsRegistered = results.numTotalTests;
  output.stats.duration = Date.now() - results.startTime;

  results.testResults.forEach(function suiteIterator(suiteResult) {
    if (suiteResult.testExecError) {
      throw new Error(suiteResult.testExecError.message);
    }

    suiteResult.testResults.forEach(function testIterator(testResult) {
      /* istanbul ignore else */
      if (testResult.status === 'passed') {
        output.passes.push({
          title: testResult.title,
          fullTitle: testResult.ancestorTitles + ' ' + testResult.title,
          duration: suiteResult.perfStats.end - suiteResult.perfStats.start,
          errorCount: testResult.failureMessages.length,
        });
      } else if (testResult.status === 'failed') {
        output.failures.push({
          title: testResult.title,
          fullTitle: testResult.ancestorTitles + ' ' + testResult.title,
          duration: suiteResult.perfStats.end - suiteResult.perfStats.start,
          errorCount: testResult.failureMessages.length,
          error: util.format(testResult.failureMessages),
        });
      } else if (testResult.status === 'pending') {
        output.stats.pending += 1;
        output.stats.skipped += 1;

        output.skipped.push({
          title: testResult.title,
          fullTitle: testResult.ancestorTitles + ' ' + testResult.title,
          duration: suiteResult.perfStats.end - suiteResult.perfStats.start,
          errorCount: testResult.failureMessages.length,
        });
      }
    });
  });

  output.stats.passPercent = Number(((output.stats.passes / output.stats.tests) * 100).toFixed(2));
  output.stats.start = new Date(results.startTime);
  output.stats.end = new Date();

  fs.writeFileSync(filename, JSON.stringify(output, null, 2), 'utf-8');
  return results;
};
