const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dynamo = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION
});

// Add Employee
const addEmployee = async (data) => {
  const params = {
    TableName: process.env.DYNAMODB_EMPLOYEES_TABLE,
    Item: {
      employeeId: uuidv4(),
      name: data.name,
      department: data.department,
      salary: data.salary,
      joinDate: new Date().toISOString()
    }
  };
  await dynamo.put(params).promise();
  return params.Item;
};

// Get All Employees
const getAllEmployees = async () => {
  const params = { TableName: process.env.DYNAMODB_EMPLOYEES_TABLE };
  const result = await dynamo.scan(params).promise();
  return result.Items;
};

// Get Employee by ID
const getEmployeeById = async (employeeId) => {
  const params = {
    TableName: process.env.DYNAMODB_EMPLOYEES_TABLE,
    Key: { employeeId }
  };
  const result = await dynamo.get(params).promise();
  return result.Item;
};

// Update Employee
const updateEmployee = async (employeeId, data) => {
  const params = {
    TableName: process.env.DYNAMODB_EMPLOYEES_TABLE,
    Key: { employeeId },
    UpdateExpression: 'set #n = :name, department = :dept, salary = :sal',
    ExpressionAttributeNames: { '#n': 'name' },
    ExpressionAttributeValues: {
      ':name': data.name,
      ':dept': data.department,
      ':sal': data.salary
    },
    ReturnValues: 'ALL_NEW'
  };
  const result = await dynamo.update(params).promise();
  return result.Attributes;
};

// Delete Employee
const deleteEmployee = async (employeeId) => {
  const params = {
    TableName: process.env.DYNAMODB_EMPLOYEES_TABLE,
    Key: { employeeId }
  };
  await dynamo.delete(params).promise();
  return { employeeId, deleted: true };
};

// Mark Attendance
const markAttendance = async (employeeId, type) => {
  const params = {
    TableName: process.env.DYNAMODB_ATTENDANCE_TABLE,
    Item: {
      recordId: uuidv4(),
      employeeId,
      type,           // 'checkin' or 'checkout'
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    }
  };
  await dynamo.put(params).promise();
  return params.Item;
};

// Get Attendance by Date
const getAttendanceByDate = async (date) => {
  const params = {
    TableName: process.env.DYNAMODB_ATTENDANCE_TABLE,
    FilterExpression: '#d = :date',
    ExpressionAttributeNames: { '#d': 'date' },
    ExpressionAttributeValues: { ':date': date }
  };
  const result = await dynamo.scan(params).promise();
  return result.Items;
};

// Get All Attendance Records
const getAllAttendance = async () => {
  const params = { TableName: process.env.DYNAMODB_ATTENDANCE_TABLE };
  const result = await dynamo.scan(params).promise();
  return result.Items;
};

module.exports = {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  markAttendance,
  getAttendanceByDate,
  getAllAttendance
};
