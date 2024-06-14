import React, { useState } from 'react';
import axios from 'axios';

function UserList() {
  const [users, setUsers] = useState([]);
  const [fetchStatus, setFetchStatus] = useState('');

  const fetchUsers = async () => {
    setFetchStatus('Fetching users...');
    try {
      const response = await axios.post('http://localhost:5000/users');
      setUsers(response.data);
      setFetchStatus('Users fetched successfully.');
    } catch (error) {
      console.error('Error fetching users:', error);
      setFetchStatus('Error fetching users.');
    }
  };

  return (
    <div>
      <h2>Users</h2>
      <button onClick={fetchUsers}>Fetch Users</button>
      <p>{fetchStatus}</p>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}

export default UserList;
