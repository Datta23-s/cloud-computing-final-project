const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({ region: process.env.AWS_REGION });

// Upload PDF to S3
const uploadPDF = async (buffer, fileName) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `payslips/${fileName}`,
    Body: buffer,
    ContentType: 'application/pdf'
  };
  const result = await s3.upload(params).promise();
  return result.Location; // Public URL
};

// Download PDF from S3
const downloadPDF = async (fileName) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `payslips/${fileName}`
  };
  const result = await s3.getObject(params).promise();
  return result.Body;
};

// List all payslips
const listPayslips = async () => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: 'payslips/'
  };
  const result = await s3.listObjectsV2(params).promise();
  return result.Contents || [];
};

// Upload Audit Log
const uploadLog = async (logData, fileName) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `logs/${fileName}`,
    Body: JSON.stringify(logData),
    ContentType: 'application/json'
  };
  await s3.upload(params).promise();
};

module.exports = { uploadPDF, downloadPDF, listPayslips, uploadLog };
