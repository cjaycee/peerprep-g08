import {useState, useEffect} from 'react';
import { type Question } from '../types/question.types.ts';
import { 
    getAllQuestions, 
    createQuestion, 
    deleteQuestion, 
    updateQuestion 
} from '../services/questionService.ts';

