const { ApolloServer, gql } = require('apollo-server')
const Sequelize = require('./database')
const User = require('./models/user')
const RegisteredTime = require('./models/registeredTime')

const typeDefs = gql`
    enum RoleEnum {
        ADMIN
        USER
    }

    type User {
        id: ID!
        name: String!
        email: String!
        password: String!
        role: RoleEnum!
    }

    type RegisteredTime {
        id: ID!
        user: User!
        timeRegistered: String!
    }

    type Query {
        allUsers: [User]
        allRegisteredTimes: [RegisteredTime]
    }

    type Mutation {
        createUser(data: CreateUserInput): User
        updateUser(id: ID! data: UpdateUserInput): User
        deleteUser(id: ID!): Boolean

        createRegisteredTime(data: CreateRegisteredTimeInput): RegisteredTime
    }

    input CreateUserInput {
        name: String!
        email: String!
        password: String!
        role: RoleEnum!
    }

    input UpdateUserInput {
        name: String
        email: String
        password: String
        role: RoleEnum
    }

    input CreateRegisteredTimeInput {
        user: CreateUserInput!
        timeRegistered: String!
    }
`

const resolver = {
    Query: {
        allUsers() {
            return User.findAll()
        },
        allRegisteredTimes() {
            return RegisteredTime.findAll({ include: [User] })
        }
    },
    Mutation: {
        async createUser(_parent, body, _context, _info) {
            //body.data.password = await bcrypt.hash(body.data.password, 10)
            return User.create(body.data)
        },

        async updateUser(_parent, body, _context, _info) {
            const user = await User.findOne({
                where: { id: body.id }
            })
            if (!user) throw new Error('Usuário não encontrado')
            const updatedUser = await user.update(body.data)
            return updatedUser
        },

        async deleteUser(_parent, body, _context, _info) {
            const user = await User.findOne({
                where: { id: body.id }
            })
            await user.destroy()
            return true
        },

        async createRegisteredTime(_parent, body, _context, _info) {
            if (body.data.user) {
                const [createdUser, created] =
                    await User.findOrCreate(
                        { where: body.data.user }
                    )
                body.data.user = null
                const registeredTime = await RegisteredTime.create(body.data)
                await registeredTime.setUser(createdUser.get('id'))
                return registeredTime.reload({ include: [User] })
            } else {
                return RegisteredTime.create(body.data, { include: [User] })
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolver,
    context({ req }) {
        return {
            headers: req.headers
        }
    }
})

Sequelize.sync().then(() => {
    server.listen().then(() => {
        console.log('Servidor rodando')
    })
})
