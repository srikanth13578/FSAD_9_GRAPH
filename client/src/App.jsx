import { useState, useEffect } from 'react';

const GQL_URL = 'http://localhost:4000/graphql';

async function gql(query, variables = {}) {
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join(', '));
  return json.data;
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ id: '', firstName: '', lastName: '', email: '' });

  const load = async () => {
    const data = await gql(`{ employees { id firstName lastName email } }`);
    setEmployees(data.employees);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.id) {
      await gql(
        `mutation($id: ID!, $f: String!, $l: String!, $e: String!) {
          updateEmployee(id: $id, firstName: $f, lastName: $l, email: $e) { id }
        }`,
        { id: form.id, f: form.firstName, l: form.lastName, e: form.email }
      );
    } else {
      await gql(
        `mutation($f: String!, $l: String!, $e: String!) {
          addEmployee(firstName: $f, lastName: $l, email: $e) { id }
        }`,
        { f: form.firstName, l: form.lastName, e: form.email }
      );
    }
    setForm({ id: '', firstName: '', lastName: '', email: '' });
    load();
  };

  const handleDelete = async (id) => {
    await gql(`mutation($id: ID!) { deleteEmployee(id: $id) }`, { id });
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Employees (GraphQL CRUD)</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <input
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          required
        />{' '}
        <input
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          required
        />{' '}
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />{' '}
        <button type="submit">{form.id ? 'Update' : 'Add'}</button>
        {form.id && (
          <button
            type="button"
            onClick={() => setForm({ id: '', firstName: '', lastName: '', email: '' })}
          >
            Cancel
          </button>
        )}
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.firstName}</td>
              <td>{emp.lastName}</td>
              <td>{emp.email}</td>
              <td>
                <button onClick={() => setForm(emp)}>Edit</button>{' '}
                <button onClick={() => handleDelete(emp.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}