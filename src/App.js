import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import UserList from './UserList'; // Import the UserList component

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(''); // State to store user ID input

  const authenticate = async (e) => {
    e.preventDefault();
    try {
      const tokenResponse = await axios.post(
        `http://localhost:5000/authenticate`,
        new URLSearchParams({
          username: username,
          password: password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Check if token is received
      if (tokenResponse.data && tokenResponse.data.return === 'success') {
        setAuthenticated(true);
        setAccessToken(tokenResponse.data.access_token);
        setError('');
        // Fetch user info here
        const userInfoResponse = await axios.get(
          `${process.env.KEYCLOAK_HOST}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.data.access_token}`,
            },
          }
        );
        setUserInfo(userInfoResponse.data);
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Invalid credentials');
      console.error('Authentication error:', error);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/insert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUploadStatus('File uploaded successfully.');
      console.log(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file.');
    }
  };

  const handleFetchUser = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUserInfo(response.data); // Set user data to state
      console.log(response.data); // Log user data to console (optional)
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Handle error state or display error message
    }
  };

  if (!authenticated) {
    return (
      <div className="App">
        <div className="login-container">
          <h1>Keycloak Login</h1>
          <form onSubmit={authenticate}>
            {error && <p className="error-message">{error}</p>}
            <label>
              Username:
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <br />
            <label>
              Password:
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <br />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Keycloak User Management</h1>

      <UserList /> {/* Use the UserList component */}

      <section>
        <h2>Upload JSON File</h2>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>Upload</button>
        <p>{uploadStatus}</p>
      </section>

      <section>
        <h2>Fetch User Data</h2>
        <label>
          Enter User ID:
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </label>
        <button onClick={handleFetchUser}>Fetch User</button>
      </section>

      <h2><a href="http://localhost:3000">Logout</a></h2>

      {userInfo && (
        <section>
          <h2>User Information</h2>
          <pre>{JSON.stringify(userInfo, null, 2)}</pre>
        </section>
      )}

    </div>
  );
}

export default App;
