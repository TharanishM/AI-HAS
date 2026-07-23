import { Op } from 'sequelize';
import Department from '../models/Department.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      where: {
        status: {
          [Op.in]: ['Active', 'Approved']
        }
      }
    });
    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (error) {
    next(error);
  }
};

export const getAllDepartmentsAdmin = async (req, res, next) => {
  try {
    const departments = await Department.findAll({});
    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;

    const departmentExists = await Department.findOne({ where: { name } });
    if (departmentExists) {
      return res.status(400).json({ success: false, message: 'Department already exists' });
    }

    const department = await Department.create({
      name,
      description,
      icon,
    });

    res.status(201).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await department.update(req.body);

    res.status(200).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

export const toggleDepartmentStatus = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    department.status = department.status === 'Active' ? 'Inactive' : 'Active';
    await department.save();

    res.status(200).json({
      success: true,
      message: `Department status changed to ${department.status}`,
      department,
    });
  } catch (error) {
    next(error);
  }
};
