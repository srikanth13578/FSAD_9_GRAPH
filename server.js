const express = require('express');
const cors = require('cors');
const { buildSchema } = require('graphql');
const { createHandler } = require('graphql-http/lib/use/express');

const schema = buildSchema(`
  type Employee {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
  }
  type Query {
    employees: [Employee!]!
  }
  type Mutation {
    addEmployee(firstName: String!, lastName: String!, email: String!): Employee!
    updateEmployee(id: ID!, firstName: String!, lastName: String!, email: String!): Employee!
    deleteEmployee(id: ID!): Boolean!
  }
`);

let employees = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
  { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
];
let nextId = 3;

const root = {
  employees: () => employees,
  addEmployee: ({ firstName, lastName, email }) => {
    const emp = { id: String(nextId++), firstName, lastName, email };
    employees.push(emp);
    return emp;
  },
  updateEmployee: ({ id, firstName, lastName, email }) => {
    const idx = employees.findIndex((e) => e.id === String(id));
    if (idx === -1) throw new Error('Not found');
    employees[idx] = { id: String(id), firstName, lastName, email };
    return employees[idx];
  },
  deleteEmployee: ({ id }) => {
    const before = employees.length;
    employees = employees.filter((e) => e.id !== String(id));
    return employees.length < before;
  },
};

const app = express();
app.use(cors());
app.all('/graphql', createHandler({ schema, rootValue: root }));
app.listen(4000, () => console.log('GraphQL running at http://localhost:4000/graphql'));