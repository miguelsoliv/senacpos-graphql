## How To

- Create/Update package.json: `npm init`
- Installing dependencies: `npm i`
- Starting server: `node src/index.js` ( http://localhost:4000/ )

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
        name: "Sample User 2"
        email: "sample2@email.com"
        password: "54321"
        role: ADMIN
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
  <summary>Create registered time</summary>
  
  ```
  mutation {
    createRegisteredTime(
      data: {
        user: {
          name: "Sample User 3"
          email: "sample3@email.com"
          password: "13245"
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

Subscribe to user (onCreatedUser) (**TODO**)

Sign in (**TODO**)