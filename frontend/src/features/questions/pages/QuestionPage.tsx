import React, { useState, useEffect } from 'react';
import { type Question } from '../types/question.types.ts';
import './QuestionPage.css';

// returns JSX.Element, so we can use it in App.tsx
export default function QuestionPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  

  const [formData, setFormData] = useState<Question>({
    title: '',
    question: '', 
    answer: '',   
    difficulty: 'easy',
    category: '',
  });

  useEffect(() => {
    setQuestions([
      { _id: '1', title: 'Reverse Array', question: 'Reverse it.', answer: 'Use a loop', difficulty: 'easy', category: 'Arrays' }
    ]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Payload sending to backend:", formData);
    alert("Question created successfully!");
    setIsAdding(false); 
  };

  return (

    <div className="dashboard-layout">
      <nav className="sidebar">
        <h2 className="brand">PeerPrep</h2>
        <ul className="nav-links">
          <li>Dashboard</li>
          <li>History</li>
          <li className="active">Questions</li>
          <li>Profile</li>
        </ul>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {isAdding ? (
          <div className="form-container">
            <h2>Add a new question</h2>
            <form onSubmit={handleSubmit} className="crud-form">
              
              <div className="form-group">
                <label>Title:</label>
                <input type="text" name="title" placeholder="Input title" value={formData.title} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Topic:</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required>
                  <option value="" disabled>Select topic</option>
                  <option value="Strings">Strings</option>
                  <option value="Arrays">Arrays</option>
                  <option value="Algorithms">Algorithms</option>
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty:</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} required>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label>Question Description:</label>
                <textarea name="question" rows={4} placeholder="Describe the problem..." value={formData.question} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Solution:</label>
                <textarea name="answer" rows={4} placeholder="Type the solution code or explanation here..." value={formData.answer} onChange={handleInputChange} required />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Submit</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="table-container">
            <header className="table-header">
              <h2>Manage Questions</h2>
              <button className="add-btn" onClick={() => setIsAdding(true)}>+ Add New</button>
            </header>
            
            <table className="question-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Topic</th>
                  <th>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q._id}>
                    <td>{q.title}</td>
                    <td>{q.category}</td>
                    <td>{q.difficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}