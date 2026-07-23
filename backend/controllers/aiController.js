import { Op } from 'sequelize';
import AIHistory from '../models/AIHistory.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { analyzeSymptoms } from '../utils/symptomAnalyzer.js';

export const consultHealthAssistant = async (req, res, next) => {
  try {
    const { symptomDescription } = req.body;
    const userId = req.user.id;

    if (!symptomDescription) {
      return res.status(400).json({ success: false, message: 'Please describe your symptoms' });
    }

    const analysis = analyzeSymptoms(symptomDescription);

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
