import { Op } from 'sequelize';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Hospital from '../models/Hospital.js';

export const getDoctors = async (req, res, next) => {
  try {
    const { department, experience, rating, availability, search, hospitalId } = req.query;

    const query = { status: 'Active' };

    if (department) {
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (uuidRegex.test(department)) {
        query.departmentId = department;
      } else {
        const deptObj = await Department.findOne({ where: { name: { [Op.like]: `%${department}%` } } });
        if (deptObj) {
          query.departmentId = deptObj.id;
        } else {
          return res.status(200).json({ success: true, count: 0, doctors: [] });
        }
      }
    }

    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    if (experience) {
      query.experience = { [Op.gte]: parseInt(experience) };
    }

    if (rating) {
      query.rating = { [Op.gte]: parseFloat(rating) };
    }

    if (availability) {
      query.availability = { [Op.like]: `%"day":"${availability}"%` };
    }

    let userIds = [];
    if (search) {
      const users = await User.findAll({
        where: {
          role: 'Doctor',
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        }
      });
      userIds = users.map(u => u.id);
    }

    if (search) {
      query[Op.or] = [
        { specialization: { [Op.like]: `%${search}%` } },
        { userId: { [Op.in]: userIds } }
      ];
    }

    const doctors = await Doctor.findAll({
      where: query,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'gender', 'avatar']
        },
        {
          model: Department,
          as: 'department'
        },
        {
          model: Hospital,
          as: 'hospital'
        }
      ]
    });

    const formattedDoctors = doctors.map(doc => {
      const plainDoc = doc.toJSON();
      let parsedAvailability = plainDoc.availability;
      if (typeof parsedAvailability === 'string') {
        try {
          parsedAvailability = JSON.parse(parsedAvailability);
        } catch (e) {
          parsedAvailability = [];
        }
      }
      let parsedQualifications = plainDoc.qualifications;
      if (typeof parsedQualifications === 'string') {
        try {
          parsedQualifications = JSON.parse(parsedQualifications);
        } catch (e) {
          parsedQualifications = [];
        }
      }
      return {
        ...plainDoc,
        _id: plainDoc.id,
        availability: parsedAvailability || [],
        qualifications: parsedQualifications || [],
        userId: plainDoc.user ? { ...plainDoc.user, _id: plainDoc.user.id } : null,
        departmentId: plainDoc.department ? { ...plainDoc.department, _id: plainDoc.department.id } : null
      };
    });

    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      doctors: formattedDoctors
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    let doctor = await Doctor.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'gender', 'avatar']
        },
        {
          model: Department,
          as: 'department'
        },
        {
          model: Hospital,
          as: 'hospital'
        }
      ]
    });

    if (!doctor) {
      doctor = await Doctor.findOne({
        where: { userId: req.params.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone', 'gender', 'avatar']
          },
          {
            model: Department,
            as: 'department'
          },
          {
            model: Hospital,
            as: 'hospital'
          }
        ]
      });
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const plainDoc = doctor.toJSON();
    let parsedAvailability = plainDoc.availability;
    if (typeof parsedAvailability === 'string') {
      try {
        parsedAvailability = JSON.parse(parsedAvailability);
      } catch (e) {
        parsedAvailability = [];
      }
    }
    let parsedQualifications = plainDoc.qualifications;
    if (typeof parsedQualifications === 'string') {
      try {
        parsedQualifications = JSON.parse(parsedQualifications);
      } catch (e) {
        parsedQualifications = [];
      }
    }
    const formattedDoctor = {
      ...plainDoc,
      _id: plainDoc.id,
      availability: parsedAvailability || [],
      qualifications: parsedQualifications || [],
      userId: plainDoc.user ? { ...plainDoc.user, _id: plainDoc.user.id } : null,
      departmentId: plainDoc.department ? { ...plainDoc.department, _id: plainDoc.department.id } : null
    };

    res.status(200).json({ success: true, doctor: formattedDoctor });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    let doctor = await Doctor.findOne({ where: { userId: req.params.id } });
    if (!doctor) {
      doctor = await Doctor.findByPk(req.params.id);
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    if (req.user.role !== 'Admin' && doctor.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to perform this action' });
    }

    doctor.availability = availability;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Availability schedule updated successfully',
      availability: doctor.availability
    });
  } catch (error) {
    next(error);
  }
};
