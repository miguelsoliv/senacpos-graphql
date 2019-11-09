const { ApolloServer, gql, PubSub, AuthenticationError } = require('apollo-server')
const Sequelize = require('./database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./models/user')
const RegisteredTime = require('./models/registeredTime')
const AuthDirective = require('./directives/auth')

const pubSub = new PubSub()

const typeDefs = gql`
    enum RoleEnum {
        ADMIN
        USER
    }

    enum TypeEnum {
        ENTRADA
        SAIDA
    }

    directive @auth(
        role: RoleEnum
    ) on OBJECT | FIELD_DEFINITION

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
        type: TypeEnum!
    }

    type Query {
        allUsers: [User]
        allRegisteredTimes: [RegisteredTime]
        filteredRegisteredTimes(idUser: String): [RegisteredTime]
    }

    type Mutation {
        createUser(data: CreateUserInput): User
        updateUser(id: ID! data: UpdateUserInput): User
        deleteUser(id: ID!): Boolean

        createRegisteredTime(data: CreateRegisteredTimeInput): RegisteredTime @auth(role: USER)

        signin(email: String! password: String!): PayloadAuth
    }

    type Subscription {
        onCreatedUser: User
        onCreatedRegisteredTime: RegisteredTime
    }

    type PayloadAuth {
        token: String!
        user: User!
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
        user: CreateRegisteredTimeUserInput!
        timeRegistered: String!
        type: TypeEnum!
    }

    input CreateRegisteredTimeUserInput {
        id: ID
        name: String
    }
`

const resolver = {
    Query: {
        allUsers() {
            return User.findAll()
        },
        allRegisteredTimes() {
            return RegisteredTime.findAll({ include: [User] })
        },
        filteredRegisteredTimes(_parent, args, body, _context, _info) {
            RegisteredTime.findByPk(args.idUser, { include: [User] }).then(registeredTime => {
                console.log(registeredTime.dataValues)
                return registeredTime.dataValues
            })
        }
    },
    Mutation: {
        async createUser(_parent, body, _context, _info) {
            body.data.password = await bcrypt.hash(body.data.password, 10)
            const user = await User.create(body.data)
            //const reloadedUser = user.reload({ include: [RegisteredTime] })
            pubSub.publish('createdUser', {
                onCreatedUser: user
            })
            return user
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
            const [createdUser, created] =
                await User.findOrCreate(
                    { where: body.data.user }
                )
            body.data.user = null
            const registeredTime = await RegisteredTime.create(body.data)
            await registeredTime.setUser(createdUser.get('id'))
            const reloadedRegisteredTime = registeredTime.reload({ include: [User] })
            pubSub.publish('createdRegisteredTime', {
                onCreatedRegisteredTime: reloadedRegisteredTime
            })
            return reloadedRegisteredTime
        },

        async signin(_parent, body, _context, _info) {
            const user = await User.findOne({
                where: { email: body.email }
            })
            if (user) {
                const isCorrect = await bcrypt.compare(
                    body.password,
                    user.password
                )
                if (!isCorrect) throw new Error('Senha inválida')
                const token = jwt.sign({ id: user.id }, 'secret')
                return { token, user }
            }
        }
    },
    Subscription: {
        onCreatedUser: {
            subscribe: () => pubSub.asyncIterator('createdUser')
        },
        onCreatedRegisteredTime: {
            subscribe: () => pubSub.asyncIterator('createdRegisteredTime')
        }
    }
}

const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolver,
    schemaDirectives: {
        auth: AuthDirective
    },
    subscriptions: {
        onConnect: async (connectionParams, webSocket) => {
            const token = connectionParams.Authorization
            if (!token) throw new AuthenticationError('Você não está autorizado')
        }
    },
    context({ req, connection }) {
        if (connection) return connection.context

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
