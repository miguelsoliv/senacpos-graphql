const { ApolloServer, gql } = require('apollo-server')
const Sequelize = require('./database')
const Book = require('./models/book')

const typeDefs = gql`
    type Book {
        id: ID!
        title: String!
        ISBN: Int!
        publicationDate: String!
    }

    type Query {
        allBooks: [Book]
    }

    type Mutation {
        createBook(data: CreateBookInput): Book
        updateBook(id: ID! data: UpdateBookInput): Book
        deleteBook(id: ID!): Boolean
    }

    input CreateBookInput {
        title: String!
        ISBN: Int!
        publicationDate: String!
    }

    input UpdateBookInput {
        title: String
        ISBN: Int
        publicationDate: String
    }
`

const resolver = {
    Query: {
        allBooks() {
            return Book.findAll()
        }
    },
    Mutation: {
        async createBook(parent, body, context, info) {
                return Book.create(body.data)
        },
        async updateBook(parent, body, context, info) {
            const book = await Book.findOne({
                where: { id: body.id }
            })
            if (!book) {
                throw new Error('Livro não encontrado')
            }
            const updatedBook = await book.update(body.data)
            return updatedBook
        },
        async deleteBook(parent, body, context, info) {
            const book = await Book.findOne({
                where: { id: body.id }
            })
            await book.destroy()
            return true
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
});


Sequelize.sync().then(() => {
    server.listen()
        .then(() => {
            console.log('Servidor rodando')
        })
})
