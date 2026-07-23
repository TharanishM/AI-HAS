import Hospital from '../models/Hospital.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import sequelize from '../config/db.js';
import { Op } from 'sequelize';

export const createHospital = async (req, res, next) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      pinCode,
      phone,
      email,
      emergencyContact,
      openingHours,
      departments,
      rating,
      latitude,
      longitude,
    } = req.body;

    let logo = '';
    let banner = '';

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        logo = `/uploads/${req.files.logo[0].filename}`;
      }
      if (req.files.banner && req.files.banner[0]) {
        banner = `/uploads/${req.files.banner[0].filename}`;
      }
    }

    const hospital = await Hospital.create({
      name,
      description,
      logo,
      banner,
      address,
      city,
      state,
      pinCode,
      phone,
      email,
      emergencyContact,
      openingHours,
      departments: departments ? (typeof departments === 'string' ? JSON.parse(departments) : departments) : [],
      rating: rating ? parseFloat(rating) : 5.0,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    });

    res.status(201).json({
      success: true,
      message: 'Hospital created successfully',
      hospital,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const fieldsToUpdate = [
      'name',
      'description',
      'address',
      'city',
      'state',
      'pinCode',
      'phone',
      'email',
      'emergencyContact',
      'openingHours',
      'rating',
      'latitude',
      'longitude',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        hospital[field] = req.body[field];
      }
    });

    if (req.body.departments !== undefined) {
      hospital.departments = typeof req.body.departments === 'string' ? JSON.parse(req.body.departments) : req.body.departments;
    }

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        hospital.logo = `/uploads/${req.files.logo[0].filename}`;
      }
      if (req.files.banner && req.files.banner[0]) {
        hospital.banner = `/uploads/${req.files.banner[0].filename}`;
      }
    }

    await hospital.save();

    res.status(200).json({
      success: true,
      message: 'Hospital updated successfully',
      hospital,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    await hospital.destroy();

    res.status(200).json({
      success: true,
      message: 'Hospital deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getHospitals = async (req, res, next) => {
  try {
    const { search, city, department, sort } = req.query;

    const whereClause = {};
    
    // Only approved hospitals for public
    if (!req.user || req.user.role !== 'Admin') {
      whereClause.status = 'Approved';
    } else if (req.query.status && req.query.status !== 'all') {
      whereClause.status = req.query.status;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    if (city) {
      whereClause.city = city;
    }

    if (department) {
      whereClause.departments = sequelize.where(
        sequelize.fn('JSON_CONTAINS', sequelize.col('departments'), JSON.stringify(department)),
        1
      );
    }

    let orderClause = [['createdAt', 'DESC']];
    if (sort === 'rating') {
      orderClause = [['rating', 'DESC']];
    } else if (sort === 'name') {
      orderClause = [['name', 'ASC']];
    }

    const hospitals = await Hospital.findAll({
      where: whereClause,
      order: orderClause,
    });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    next(error);
  }
};

export const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const doctors = await Doctor.findAll({
      where: { hospitalId: hospital.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'gender', 'avatar'],
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
      ],
    });

    const formattedDoctors = doctors.map(doc => {
      const plain = doc.toJSON();
      return {
        ...plain,
        _id: plain.id,
        userId: plain.user ? { ...plain.user, _id: plain.user.id } : null,
      };
    });

    res.status(200).json({
      success: true,
      hospital,
      doctors: formattedDoctors,
    });
  } catch (error) {
    next(error);
  }
};
