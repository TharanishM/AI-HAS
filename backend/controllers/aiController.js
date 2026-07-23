import { Op } from 'sequelize';
import AIHistory from '../models/AIHistory.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { analyzeSymptoms } from '../utils/symptomAnalyzer.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const consultHealthAssistant = async (req, res, next) => {
  try {
    const { symptomDescription } = req.body;
    const userId = req.user.id;

    if (!symptomDescription) {
      return res.status(400).json({ success: false, message: 'Please describe your symptoms' });
    }

    let analysis;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const prompt = `You are an AI medical symptom analyzer. Analyze these symptoms: "${symptomDescription}".
        Return ONLY a JSON response in the following schema:
        {
          "predictedConditions": [{"condition": "condition name", "confidence": 90, "severity": "High|Medium|Low"}],
          "recommendedDepartment": "Cardiology|Neurology|Orthopaedics|Dermatology|Pediatrics|Gynecology|Oncology|Gastroenterology|Pulmonology|Nephrology|Urology|ENT|General Surgery|Emergency Medicine|General Medicine",
          "suggestedPrecautions": ["precaution 1", "precaution 2"]
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        analysis = JSON.parse(cleanedText);
      } catch (geminiError) {
        console.error('Gemini API call failed, falling back to local analyzer:', geminiError);
        analysis = analyzeSymptoms(symptomDescription);
      }
    } else {
      analysis = analyzeSymptoms(symptomDescription);
    }

    const historyItem = await AIHistory.create({
      userId,
      symptomDescription,
      predictedConditions: analysis.predictedConditions,
      recommendedDepartment: analysis.recommendedDepartment,
      suggestedPrecautions: analysis.suggestedPrecautions,
    });

    const department = await Department.findOne({
      where: {
        name: { [Op.like]: `%${analysis.recommendedDepartment}%` }
      }
    });

    let recommendedDoctors = [];
    if (department) {
      const doctors = await Doctor.findAll({
        where: {
          departmentId: department.id,
          status: 'Active'
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone', 'avatar']
          }
        ],
        limit: 3
      });

      recommendedDoctors = doctors.map(doc => {
        const plain = doc.toJSON();
        return {
          ...plain,
          _id: plain.id,
          userId: plain.user ? { ...plain.user, _id: plain.user.id } : null
        };
      });
    }

    res.status(200).json({
      success: true,
      analysis: {
        ...analysis,
        historyId: historyItem.id,
        recommendedDoctors
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAIHistory = async (req, res, next) => {
  try {
    const history = await AIHistory.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']]
    });
    res.status(200).json({ success: true, count: history.length, history });
  } catch (error) {
    next(error);
  }
};
