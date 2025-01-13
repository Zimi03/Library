import React, { useState } from "react";
import { Book } from "../books.tsx";

interface AddBookModalProps {
  show: boolean;
  handleClose: () => void;
  handleAddBook: (book: Book) => void;
}

const AddBookModal = ({ show, handleClose, handleAddBook }: AddBookModalProps) => {
  const [newBook, setNewBook] = useState<Book>({
    id: 0,
    title: "",
    author: "",
    genre: "",
    status: "dostępna",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddBook(newBook);
    handleClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto">
      <div className="bg-gray-900 p-5 px-10 rounded-md">
        <h2 className="text-lg font-bold mb-4 text-white text-center">Add New Book</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md  bg-gray-600"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 ">Author</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md  bg-gray-600"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Genre</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md  bg-gray-600"
              value={newBook.genre}
              onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <button type="button" className="mr-2 p-2 bg-gray-500 text-white rounded-md" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="p-2 bg-blue-500 text-white rounded-md">
              Add Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
