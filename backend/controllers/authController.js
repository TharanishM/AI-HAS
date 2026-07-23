import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
import Department from '../models/Department.js';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

const formatDoctorProfile = (profile) => {
  if (!profile) return null;
  const plain = profile.toJSON ? profile.toJSON() : profile;
  
  let parsedAvailability = plain.availability;
  if (typeof parsedAvailability === 'string') {
    try {
      parsedAvailability = JSON.parse(parsedAvailability);
    } catch (e) {
      parsedAvailability = [];
    }
  }
  
  let parsedQualifications = plain.qualifications;
  if (typeof parsedQualifications === 'string') {
    try {
      parsedQualifications = JSON.parse(parsedQualifications);
    } catch (e) {
      parsedQualifications = [];
    }
  }
  
  return {
    ...plain,
    availability: parsedAvailability || [],
    qualifications: parsedQualifications || []
  };
};

export const registerPatient = async (req, res, next) => {
  try {
    const { name, email, password, phone, gender, dateOfBirth, bloodGroup, address } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already registered with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'Patient',
      phone,
      gender,
    });

    const patient = await Patient.create({
      userId: user.id,
      dateOfBirth,
      bloodGroup,
      address,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user.id),
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        avatar: user.avatar,
      },
      patient,
    });
  } catch (error) {
    next(error);
  }
};

export const registerDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      specialization,
      departmentId,
      hospitalId,
      experience,
      fees,
      qualifications,
      biography,
      languages,
      availability,
      newHospitalName,
      newHospitalAddress,
      newHospitalCity,
      newHospitalState,
      newHospitalPinCode,
      newHospitalPhone,
      newHospitalEmail,
      newHospitalEmergencyContact,
      newDepartmentName,
      newDepartmentDescription,
    } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    let finalHospitalId = hospitalId || null;
    let finalDepartmentId = departmentId || null;

    if (newHospitalName) {
      const newHosp = await Hospital.create({
        name: newHospitalName,
        address: newHospitalAddress || 'Pending Address',
        city: newHospitalCity || 'Coimbatore',
        state: newHospitalState || 'Tamil Nadu',
        pinCode: newHospitalPinCode || '641001',
        phone: newHospitalPhone || '+91 422 111 2222',
        email: newHospitalEmail || 'pending@hospital.com',
        emergencyContact: newHospitalEmergencyContact || '+91 422 111 2222',
        departments: [newDepartmentName || 'General Medicine'],
        status: 'Pending'
      });
      finalHospitalId = newHosp.id;
    }

    if (newDepartmentName) {
      let dept = await Department.findOne({ where: { name: newDepartmentName } });
      if (!dept) {
        dept = await Department.create({
          name: newDepartmentName,
          description: newDepartmentDescription || 'Pending approval description',
          icon: 'Activity',
          status: 'Pending'
        });
      }
      finalDepartmentId = dept.id;
    }

    let avatarUrl = '';
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'Doctor',
      phone,
      gender,
      avatar: avatarUrl
    });

    const doctor = await Doctor.create({
      userId: user.id,
      specialization,
      departmentId: finalDepartmentId,
      hospitalId: finalHospitalId,
      experience: experience ? parseInt(experience) : 0,
      fees: fees ? parseInt(fees) : 0,
      qualifications: qualifications ? (typeof qualifications === 'string' ? JSON.parse(qualifications) : qualifications) : [],
      biography: biography || '',
      languages: languages ? (typeof languages === 'string' ? JSON.parse(languages) : languages) : ['English', 'Tamil'],
      availability: availability ? (typeof availability === 'string' ? JSON.parse(availability) : availability) : [],
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Doctor registration submitted successfully and is pending admin approval.',
      user,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Append Login History
    const history = user.loginHistory || [];
    history.push({
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      timestamp: new Date()
    });
    user.loginHistory = history;
    await user.save();

    if (user.isTwoFactorEnabled) {
      // Prompt client for 2FA instead of sending JWT immediately
      return res.status(200).json({
        success: true,
        requires2FA: true,
        userId: user.id
      });
    }

    let extraProfile = null;
    if (user.role === 'Patient') {
      extraProfile = await Patient.findOne({ where: { userId: user.id } });
    } else if (user.role === 'Doctor') {
      const docProfile = await Doctor.findOne({
        where: { userId: user.id },
        include: ['department']
      });
      if (docProfile) {
        if (docProfile.status === 'Pending') {
          return res.status(403).json({ success: false, message: 'Your profile is pending admin approval.' });
        }
        if (docProfile.status === 'Rejected') {
          return res.status(403).json({ success: false, message: 'Your registration request has been rejected by the admin.' });
        }
      }
      extraProfile = formatDoctorProfile(docProfile);
    }

    res.status(200).json({
      success: true,
      token: generateToken(user.id),
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        avatar: user.avatar,
      },
      profile: extraProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    let extraProfile = null;

    if (user.role === 'Patient') {
      extraProfile = await Patient.findOne({ where: { userId: user.id } });
    } else if (user.role === 'Doctor') {
      const docProfile = await Doctor.findOne({
        where: { userId: user.id },
        include: ['department']
      });
      if (docProfile) {
        if (docProfile.status === 'Pending' || docProfile.status === 'Rejected') {
          return res.status(403).json({ success: false, message: 'Account is not approved or active.' });
        }
      }
      extraProfile = formatDoctorProfile(docProfile);
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        avatar: user.avatar,
      },
      profile: extraProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, gender, avatar, ...extraData } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    let extraProfile = null;
    if (user.role === 'Patient') {
      extraProfile = await Patient.findOne({ where: { userId: user.id } });
      if (extraProfile) {
        if (extraData.dateOfBirth) extraProfile.dateOfBirth = extraData.dateOfBirth;
        if (extraData.bloodGroup) extraProfile.bloodGroup = extraData.bloodGroup;
        if (extraData.address) extraProfile.address = extraData.address;
        if (extraData.allergies) extraProfile.allergies = extraData.allergies;
        if (extraData.medicalHistory) extraProfile.medicalHistory = extraData.medicalHistory;
        if (extraData.familyMembers) extraProfile.familyMembers = extraData.familyMembers;
        if (extraData.insuranceInfo) extraProfile.insuranceInfo = extraData.insuranceInfo;
        await extraProfile.save();
      }
    } else if (user.role === 'Doctor') {
      extraProfile = await Doctor.findOne({ where: { userId: user.id } });
      if (extraProfile) {
        if (extraData.specialization) extraProfile.specialization = extraData.specialization;
        if (extraData.experience !== undefined) extraProfile.experience = extraData.experience;
        if (extraData.fees !== undefined) extraProfile.fees = extraData.fees;
        if (extraData.qualifications) extraProfile.qualifications = extraData.qualifications;
        if (extraData.biography !== undefined) extraProfile.biography = extraData.biography;
        if (extraData.availability) extraProfile.availability = extraData.availability;
        await extraProfile.save();
        const docProfile = await Doctor.findOne({
          where: { userId: user.id },
          include: ['department']
        });
        extraProfile = formatDoctorProfile(docProfile);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        avatar: user.avatar,
      },
      profile: extraProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully',
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newToken = generateToken(decoded.id);
    res.status(200).json({ success: true, token: newToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }
};

import { TOTP } from 'otplib';
import QRCode from 'qrcode';

export const enable2FA = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const totp = new TOTP();
    const secret = totp.generateSecret();
    user.twoFactorSecret = secret;
    await user.save();

    const otpAuthUrl = totp.generateURI({ issuer: 'AI Hospital System', label: user.email, secret });
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    res.status(200).json({
      success: true,
      secret,
      qrCode: qrCodeDataUrl
    });
  } catch (error) {
    next(error);
  }
};

export const disable2FA = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    res.status(200).json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    next(error);
  }
};

export const verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const totp = new TOTP();
    const isValid = totp.verifySync({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA token' });
    }

    user.isTwoFactorEnabled = true;
    await user.save();

    res.status(200).json({ success: true, message: '2FA enabled and verified successfully!' });
  } catch (error) {
    next(error);
  }
};

export const verify2FALogin = async (req, res, next) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const totp = new TOTP();
    const isValid = totp.verifySync({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA token' });
    }

    let extraProfile = null;
    if (user.role === 'Patient') {
      extraProfile = await Patient.findOne({ where: { userId: user.id } });
    } else if (user.role === 'Doctor') {
      const docProfile = await Doctor.findOne({
        where: { userId: user.id },
        include: ['department']
      });
      extraProfile = formatDoctorProfile(docProfile);
    }

    res.status(200).json({
      success: true,
      token: generateToken(user.id),
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        avatar: user.avatar,
      },
      profile: extraProfile
    });
  } catch (error) {
    next(error);
  }
};
