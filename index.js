const http = require('http');
const fs = require('fs');
const path = require('path');
const {authenticateUser} = require('./authenticate')

const booksDbPath = path.join(__dirname, "db", 'books.json');
const usersDbPath = path.join(__dirname, "db", 'users.json');

const PORT = 5000
const HOST_NAME = 'localhost';




function RequestHandler(req, res) {
    if (req.url === '/users' && req.method === 'GET') {
        //Get All Users
        authenticateUser(req, res)
            .then(() => {
                getAllUsers(req, res)
            }).catch((err) => {
                res.writeHead(401)
                res.end(JSON.stringify({
                    message: err
                }))
            })
    } else if (req.url === '/users' && req.method === 'POST') {
        //Create a New User
        createUser(req, res)
    } else if (req.url === '/books' && req.method === 'GET') {
        //Get All Books
        getAllbooks(req, res)
    } else if (req.url === '/books' && req.method === 'POST') {
        //Create a Book
        addBook(req, res)
    } else if (req.url === '/books' && req.method === 'PUT') {
        //Update a Book
        updateBook(req, res);
    } else if (req.url.startsWith('/books') && req.method === 'DELETE') {
        //Delete a Book
        deleteBook(req, res);
    } else if (req.url.startsWith('/loanbook') && req.method === 'PUT') {
        //Loan out a Book
        loanBook(req, res);
    } else {
        //Inavlid Book API
        res.writeHead(404);
        res.end(JSON.stringify({
            message: 'Invalid Route'
        }))
    }
}

function getAllUsers(req, res) {
    fs.readFile(usersDbPath, "utf8", (err, data) => {
        if (err) {
            res.writeHead(400)
            res.end("error occured")
        }
        res.end(data)
    })
}

function createUser (req, res) {
    const body= []

    req.on("data", (chunk) => {
        body.push(chunk)
    })

    req.on("end", () => {
        const parsedUser = Buffer.concat(body).toString()

        if(!parsedUser){
            res.end(JSON.stringify({
                message: "Please provide a username and password in a JSON format to create a user"
            }))
            return
        }

        const newUser = JSON.parse(parsedUser)

        // get ID of last user and assign an id to the new user
        const lastUser = usersDB[usersDB.length - 1];
        const lastUserId = lastUser.id;
        newUser.id = lastUserId + 1;

        //Create new User
        fs.readFile(usersDbPath, "utf8", (err, data) => {
            if (err) {
                res.writeHead(401)
                res.end("error occured")
            }

            const existingUsers = JSON.parse(data)
            const allUsers = [...existingUsers, newUser]

            fs.writeFile(usersDbPath, JSON.stringify(allUsers), (err) => {
                if (err) {
                    res.writeHead(500)
                    res.end(JSON.stringify({
                        message: 'Server Error. Could not Create User.'
                    }))

                }
                res.end("user created")
            })
        })
    })
}


function getAllbooks(req, res) {
    fs.readFile(booksDbPath, "utf8", (err, data) => {
        if (err) {
            res.writeHead(400)
            res.end("An error occured")
        }
        res.end(data)
    })
}

function addBook (req, res) {
    const body= []

    req.on("data", (chunk) => {
        body.push(chunk)
    })

    req.on("end", () => {
        const parsedBook = Buffer.concat(body).toString()

        if(!parsedBook){
            res.end(JSON.stringify({
                message: "Please provide a title, author and year in a JSON format to create a book"
            }))
            return
        }

        const newBook = JSON.parse(parsedBook)
        
        // get ID of last book and assign an id to the new book
        const lastBook = booksDB[booksDB.length - 1];
        const lastBookId = lastBook.id;
        newBook.id = lastBookId + 1;
        

        //Add new Book
        fs.readFile(booksDbPath, "utf8", (err, data) => {
            if (err) {
                res.writeHead(400)
                res.end("An error occured")
            }

            const existingBooks = JSON.parse(data)
            const allBooks = [...existingBooks, newBook]

            fs.writeFile(booksDbPath, JSON.stringify(allBooks), (err) => {
                if (err) {
                    res.writeHead(500)
                    res.end(JSON.stringify({
                        message: 'Server Error. Could not Add Book.'
                    }))
                }
                res.end("Book Added Successfully")
            })
        })
    })
}

function updateBook(req, res) {
    const body = []

    req.on("data", (chunk) => {
        body.push(chunk)
    })

    req.on("end", () => {
        const parsedBook = Buffer.concat(body).toString()

        if(!parsedBook){
            res.end(JSON.stringify({
                message: "Please provide the book id and details to update in a JSON format to update a book"
            }))
            return
        }

        const detailsToUpdate = JSON.parse(parsedBook)
        const bookId = detailsToUpdate.id

        fs.readFile(booksDbPath, "utf8", (err, books) => {
            if (err) {
                res.writeHead(400)
                res.end("An error occured")
            }

            const booksObject = JSON.parse(books)

            const bookIndex = booksObject.findIndex(book => book.id === bookId)

            if (bookIndex === -1) {
                res.writeHead(404)
                res.end(`Book with the id:${bookId} not found!`, null)
                return
            }

            const updatedBook = { ...booksObject[bookIndex], ...detailsToUpdate }
            booksObject[bookIndex] = updatedBook

            fs.writeFile(booksDbPath, JSON.stringify(booksObject), (err) => {
                if (err) {
                    res.writeHead(500)
                    res.end(JSON.stringify({
                        message: "Server Error. Could not update book to database."
                    }))
                }

                res.writeHead(200)
                res.end("Book has been successfully updated!")
            })
        })
    })
}

function deleteBook(req, res) {
    const body = []

    req.on("data", (chunk) => {
        body.push(chunk)
    })

    req.on("end", () => {
        const parsedBook = Buffer.concat(body).toString()

        if(!parsedBook){
            res.end(JSON.stringify({
                message: "Please provide the book id in a JSON format to delete a book"
            }))
            return
        }

        const detailsToDelete = JSON.parse(parsedBook)
        const bookId = detailsToDelete.id

        fs.readFile(booksDbPath, "utf8", (err, books) => {
            if (err) {
                res.writeHead(400)
                res.end("An error occured")
            }

            const booksObject = JSON.parse(books)

            const bookIndex = booksObject.findIndex(book => book.id === bookId)

            if (bookIndex === -1) {
                res.writeHead(404)
                res.end(`Book with the id:${bookId} not found!`, null)
                return
            }

            booksObject.splice(bookIndex, 1)

            fs.writeFile(booksDbPath, JSON.stringify(booksObject), (err) => {
                if (err) {
                    res.writeHead(500)
                    res.end(JSON.stringify({
                        message: "Server Error. Could not delete book from database."
                    }))
                }

                res.writeHead(200)
                res.end("Book has been deleted!")
            })
        })
    })
}

function loanBook(req, res) {
    const body = []

    req.on("data", (chunk) => {
        body.push(chunk)
    })

    req.on("end", () => {
        const parsedBook = Buffer.concat(body).toString()

        if(!parsedBook){
            res.end(JSON.stringify({
                message: "Please provide the book id and loan status in a JSON format to update a book loan status"
            }))
            return
        }

        const detailsToUpdate = JSON.parse(parsedBook)
        const bookId = detailsToUpdate.id

        fs.readFile(booksDbPath, "utf8", (err, books) => {
            if (err) {
                res.writeHead(400)
                res.end("An error occured")
            }

            const booksObject = JSON.parse(books)

            const bookIndex = booksObject.findIndex(book => book.id === bookId)

            if (bookIndex === -1) {
                res.writeHead(404)
                res.end(`Book with the id:${bookId} not found!`, null)
                return
            }

            const updatedBook = { ...booksObject[bookIndex], ...detailsToUpdate }
            booksObject[bookIndex] = updatedBook

            fs.writeFile(booksDbPath, JSON.stringify(booksObject), (err) => {
                if (err) {
                    res.writeHead(500)
                    res.end(JSON.stringify({
                        message: "Server Error. Could not update loan status of the book to database."
                    }))
                }

                res.writeHead(200)
                res.end("Book loan status has been successfully updated!")
            })
        })
    })
}


const server = http.createServer(RequestHandler)

server.listen(PORT, HOST_NAME, () => {
    booksDB = JSON.parse(fs.readFileSync(booksDbPath, 'utf8'));
    usersDB = JSON.parse(fs.readFileSync(usersDbPath, 'utf8'));
    console.log(`Server is listening on ${HOST_NAME}:${PORT}`)
})