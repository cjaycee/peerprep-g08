const Question = require('../models/questionModel');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public  
const getAllQuestions = async (req, res) => {
    const questions = await Question.find({})
    res.status(200).json(questions)
}

module.exports = {
    getAllQuestions,
}