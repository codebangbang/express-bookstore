process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async function () {
  let result = await db.query(`
        INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES (
            '1234567890',
            'https://amazon.com',
            'Ryan',
            'English',
            1000,
            'Nothing',
            'Ryan's book',
            2024
        )
        RETURNING isbn`);
  book_isbn = result.rows[0].isbn;
});

describe("GET /books", function () {
  test("Gets a list of 1 book", async function () {
    const response = await request(app).get(`/books`);
    const books = response.body.books;
    expect(books).toHaveLength(1);
    expect(books[0]).toHaveProperty("isbn");
    expect(books[0]).toHaveProperty("author");
    expect(books[0]).toHaveProperty("language");
    expect(books[0]).toHaveProperty("pages");
    expect(books[0]).toHaveProperty("publisher");
    expect(books[0]).toHaveProperty("title");
    expect(books[0]).toHaveProperty("year");
  });
});

describe("GET /books/:id", function () {
  test("Gets a single book", async function () {
    const response = await request(app).get(`/books/${book_isbn}`);
    expect(response.body).toEqual({
      book: {
        isbn: book_isbn,
        amazon_url: "https://amazon.com",
      },
    });
  });

  describe("POST /books", function () {
    test("Creates a new book", async function () {
      const response = await request(app).post(`/books`).send({
        isbn: "1234567891",
        amazon_url: "https://amazon.com",
      });
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        book: {
          isbn: "1234567891",
          amazon_url: "https://amazon.com",
        },
      });
    });
  });

  describe("PUT /books/:isbn", function () {
    test("Updates a single book", async function () {
      const response = await request(app).put(`/books/${book_isbn}`).send({
        isbn: "1234567891",
        amazon_url: "https://amazon.com",
      });
      expect(response.body).toEqual({
        book: {
          isbn: "1234567891",
          amazon_url: "https://amazon.com",
        },
      });
    });
  });

  describe("DELETE /books/:isbn", function () {
    test("Deletes a single book", async function () {
      const response = await request(app).delete(`/books/${book_isbn}`);
      expect(response.body).toEqual({ message: "Book deleted" });
    });
  });
});

afterAll(async function () {
  await db.end();
});
