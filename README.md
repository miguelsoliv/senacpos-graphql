## How To

- Create/Update package.json: `npm init`
- Installing dependencies: `npm i`
- Starting server: `node src/index.js` ( http://localhost:4000/ )
- Authenticate: copy the token from the 'signin' method and paste it into the HTTP Headers section in the following format: `{ "Authorization": "Bearer [ your token ]" }`

## Examples

<details>
  <summary>List all users</summary>
  
  ```
  query {
    allUsers {
      id
      name
      email
      password
      role
    }
  }
  ```
</details>

<details>
  <summary>List all registered times</summary>
  
  ```
  query {
    allRegisteredTimes {
      id
      user {
        id
        name
        email
        password
        role
      }
      timeRegistered
    }
  }
  ```
</details>

<details>
  <summary>Create user</summary>
  
  ```
  mutation {
    createUser(
      data: {
        name: "Sample User"
        email: "sample@email.com"
        password: "1234"
        role: USER
      }
    ){
      id
      name
      email
      password
      role
    }
  }
  ```
</details>

<details>
  <summary>Create registered time (USER only)</summary>
  
  ```
  mutation {
    createRegisteredTime(
      data: {
        user: {
          name: "Sample User"
          email: "sample@email.com"
          password: [ your encrypted password ]
          role: USER
        }
        timeRegistered: "2005-10-08"
      }
    ) {
      id
      user {
        id
        name
      }
      timeRegistered
    }
  }
  ```
</details>

<details>
  <summary>Update user</summary>
  
  ```
  mutation {
    updateUser(
      id: "1"
      data: {
        name: "New Name"
        email: "new_sample@email.com"
      }
    ) {
      id
      name
      email
    }
  }
  ```
</details>

<details>
  <summary>Delete user</summary>
  
  ```
  mutation {
    deleteUser(
      id: "3"
    )
  }
  ```
</details>

<details>
  <summary>Sign in</summary>
  
  ```
  mutation {
    signin(
      email: "sample@email.com"
      password: "1234"
    ) {
      token
      user {
        role
      }
    }
  }
  ```
</details>

<details>
  <summary>Subscribe to user - onCreatedUser (Authenticated only)</summary>
  
  ```
  subscription {
    onCreatedUser {
      id
      name
      email
      role
    }
  }
  ```
</details>
