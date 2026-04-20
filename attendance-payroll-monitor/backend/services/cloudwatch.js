const AWS = require('aws-sdk');
require('dotenv').config();

const cloudwatch = new AWS.CloudWatch({ region: process.env.AWS_REGION });
const cloudwatchLogs = new AWS.CloudWatchLogs({ region: process.env.AWS_REGION });

// Push custom metric to CloudWatch
const pushMetric = async (metricName, value, unit = 'Count') => {
  const params = {
    Namespace: 'AttendancePayrollApp',
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
        Dimensions: [
          {
            Name: 'Environment',
            Value: process.env.NODE_ENV || 'development'
          }
        ]
      }
    ]
  };
  await cloudwatch.putMetricData(params).promise();
  console.log(`Metric pushed: ${metricName} = ${value}`);
};

// Push attendance rate metric
const pushAttendanceRate = async (totalEmployees, presentCount) => {
  const rate = totalEmployees > 0 ? (presentCount / totalEmployees) * 100 : 0;
  await pushMetric('AttendanceRate', rate, 'Percent');
  return rate;
};

// Push payroll generation count
const pushPayrollGenerated = async () => {
  await pushMetric('PayrollGenerated', 1, 'Count');
};

// Get metric statistics
const getMetricStats = async (metricName, period = 3600, stat = 'Average') => {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

  const params = {
    Namespace: 'AttendancePayrollApp',
    MetricName: metricName,
    StartTime: startTime,
    EndTime: endTime,
    Period: period,
    Statistics: [stat],
    Dimensions: [
      {
        Name: 'Environment',
        Value: process.env.NODE_ENV || 'development'
      }
    ]
  };
  const result = await cloudwatch.getMetricStatistics(params).promise();
  return result.Datapoints;
};

// Send log event to CloudWatch Logs
const sendLogEvent = async (message) => {
  const logGroupName = process.env.CLOUDWATCH_LOG_GROUP;
  const logStreamName = `app-${new Date().toISOString().split('T')[0]}`;

  try {
    // Ensure log group exists
    try {
      await cloudwatchLogs.createLogGroup({ logGroupName }).promise();
    } catch (err) {
      if (err.code !== 'ResourceAlreadyExistsException') throw err;
    }

    // Ensure log stream exists
    try {
      await cloudwatchLogs.createLogStream({ logGroupName, logStreamName }).promise();
    } catch (err) {
      if (err.code !== 'ResourceAlreadyExistsException') throw err;
    }

    const params = {
      logGroupName,
      logStreamName,
      logEvents: [
        {
          message: typeof message === 'string' ? message : JSON.stringify(message),
          timestamp: Date.now()
        }
      ]
    };
    await cloudwatchLogs.putLogEvents(params).promise();
  } catch (err) {
    console.error('CloudWatch log error:', err.message);
  }
};

module.exports = {
  pushMetric,
  pushAttendanceRate,
  pushPayrollGenerated,
  getMetricStats,
  sendLogEvent
};
