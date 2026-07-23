import dotenv from 'dotenv';
import sequelize, { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Department from '../models/Department.js';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import MedicalRecord from '../models/MedicalRecord.js';
import AIHistory from '../models/AIHistory.js';
import Hospital from '../models/Hospital.js';

dotenv.config();

const departments = [
  { name: 'General Medicine', description: 'Comprehensive primary care, wellness visits, and disease prevention.', icon: 'Stethoscope' },
  { name: 'Cardiology', description: 'Expert care for your heart and cardiovascular system.', icon: 'Heart' },
  { name: 'Neurology', description: 'Specialized diagnosis and treatment of brain, spinal cord, and nerve disorders.', icon: 'Brain' },
  { name: 'Orthopaedics', description: 'Surgical and non-surgical treatment of bones, joints, ligaments, and tendons.', icon: 'Activity' },
  { name: 'Dermatology', description: 'Advanced treatment for skin, hair, nails, and cosmetic concerns.', icon: 'Sparkles' },
  { name: 'Pediatrics', description: 'Dedicated healthcare for infants, children, and adolescents.', icon: 'Baby' },
  { name: 'Gynecology', description: 'Women health and reproductive medicine services.', icon: 'User' },
  { name: 'Oncology', description: 'State of the art cancer diagnosis, treatment, and support services.', icon: 'Shield' },
  { name: 'Gastroenterology', description: 'Comprehensive digestive tract, liver, and pancreatic care.', icon: 'Flame' },
  { name: 'Pulmonology', description: 'Diagnosis and management of lung and respiratory system conditions.', icon: 'Wind' },
  { name: 'Nephrology', description: 'Advanced diagnosis and care for kidney conditions and hypertension.', icon: 'Filter' },
  { name: 'Urology', description: 'Urinary tract and male reproductive system specialists.', icon: 'Droplet' },
  { name: 'ENT', description: 'Expert ear, nose, throat, head and neck medical services.', icon: 'Volume2' },
  { name: 'General Surgery', description: 'Advanced surgical interventions and post-operative recovery support.', icon: 'Scissors' },
  { name: 'Emergency Medicine', description: '24/7 immediate trauma and acute illness care.', icon: 'ShieldAlert' }
];

const seedDB = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Syncing database models...');
    await sequelize.sync({ alter: true });
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await User.destroy({ where: {} });
    await Patient.destroy({ where: {} });
    await Doctor.destroy({ where: {} });
    await Department.destroy({ where: {} });
    await Hospital.destroy({ where: {} });
    await Appointment.destroy({ where: {} });
    await MedicalRecord.destroy({ where: {} });
    await Notification.destroy({ where: {} });
    await AIHistory.destroy({ where: {} });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Database cleaned.');

    const createdDepts = await Department.bulkCreate(departments);
    console.log(`${createdDepts.length} departments seeded.`);

    const deptMap = {};
    createdDepts.forEach(d => {
      deptMap[d.name] = d.id;
    });

    const hospitalsData = [
      {
        name: 'G. Kuppuswamy Naidu Memorial Hospital (GKNM)',
        description: 'Renowned super-speciality hospital delivering top-tier cardiology, oncology, and pediatric care in Coimbatore since 1952.',
        address: 'P.N. Palayam, Coimbatore',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641037',
        phone: '+91 422 224 5000',
        email: 'info@gknmhospital.org',
        emergencyContact: '+91 422 224 3501',
        openingHours: '24 Hours',
        departments: ['Cardiology', 'Oncology', 'Pediatrics', 'General Medicine'],
        rating: 4.7,
        latitude: 11.0135,
        longitude: 76.9798,
        status: 'Approved'
      },
      {
        name: 'PSG Hospitals',
        description: 'Multi-speciality teaching hospital offering comprehensive research-driven clinical services with state of the art equipment.',
        address: 'Avinashi Road, Peelamedu',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641004',
        phone: '+91 422 257 0170',
        email: 'contact@psghospitals.ac.in',
        emergencyContact: '+91 422 259 8822',
        openingHours: '24 Hours',
        departments: ['Cardiology', 'Neurology', 'Orthopaedics', 'General Medicine', 'Nephrology'],
        rating: 4.6,
        latitude: 11.0253,
        longitude: 77.0276,
        status: 'Approved'
      },
      {
        name: 'KMCH (Kovai Medical Center and Hospital)',
        description: 'Coimbatore\'s premier corporate hospital recognized for pioneering organ transplantations and advanced trauma care.',
        address: 'Avinashi Road, Civil Aerodrome Post',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641014',
        phone: '+91 422 432 3800',
        email: 'info@kovaimedical.org',
        emergencyContact: '+91 422 432 3200',
        openingHours: '24 Hours',
        departments: ['Neurology', 'Cardiology', 'Orthopaedics', 'Urology', 'Emergency Medicine'],
        rating: 4.8,
        latitude: 11.0422,
        longitude: 77.0371,
        status: 'Approved'
      },
      {
        name: 'Royal Care Super Speciality Hospital',
        description: 'A tertiary care hospital delivering affordable and high-quality clinical care with cutting-edge medical technologies.',
        address: 'Neelambur Bypass Road',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641062',
        phone: '+91 422 222 7000',
        email: 'info@royalcarehospital.in',
        emergencyContact: '+91 422 222 7108',
        openingHours: '24 Hours',
        departments: ['Pulmonology', 'ENT', 'General Surgery', 'Orthopaedics'],
        rating: 4.7,
        latitude: 11.0712,
        longitude: 77.0864,
        status: 'Approved'
      },
      {
        name: 'Sri Ramakrishna Hospital',
        description: 'Driven by service excellence, providing top-class multi-speciality healthcare services for over three decades.',
        address: '395, Sarojini Naidu Road, Sidhapudur',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641044',
        phone: '+91 422 450 0000',
        email: 'info@sriramakrishnahospital.com',
        emergencyContact: '+91 422 450 0108',
        openingHours: '24 Hours',
        departments: ['Dermatology', 'Gynecology', 'Pediatrics', 'General Surgery'],
        rating: 4.7,
        latitude: 11.0189,
        longitude: 76.9745,
        status: 'Approved'
      },
      {
        name: 'Kauvery Hospital Coimbatore',
        description: 'Offering modern multi-speciality care with an emphasis on customer-centric clinical excellence and patient safety.',
        address: '100 Feet Road, Gandhipuram',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641012',
        phone: '+91 422 400 6000',
        email: 'info.cbe@kauveryhospital.com',
        emergencyContact: '+91 422 400 6108',
        openingHours: '24 Hours',
        departments: ['Gastroenterology', 'Emergency Medicine', 'Neurology', 'Oncology'],
        rating: 4.5,
        latitude: 11.0234,
        longitude: 76.9712,
        status: 'Approved'
      },
      {
        name: 'Sree Abirami Hospitals',
        description: 'Super-speciality hospital specializing in advanced trauma care, joint replacement, and comprehensive family medicine.',
        address: 'Eachanari Post, Madukkarai Road',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641021',
        phone: '+91 422 246 6666',
        email: 'contact@abiramihospital.com',
        emergencyContact: '+91 422 246 6108',
        openingHours: '24 Hours',
        departments: ['Orthopaedics', 'General Medicine', 'Gynecology'],
        rating: 4.4,
        latitude: 10.9385,
        longitude: 76.9723,
        status: 'Approved'
      },
      {
        name: 'Ashwin Hospital',
        description: 'A trusted multi-speciality community hospital known for critical care medicine and prompt clinical diagnostic support.',
        address: 'Alagesan Road, Saibaba Colony',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641011',
        phone: '+91 422 244 4645',
        email: 'info@ashwinhospital.com',
        emergencyContact: '+91 422 244 4108',
        openingHours: '24 Hours',
        departments: ['Pediatrics', 'General Medicine', 'ENT'],
        rating: 4.3,
        latitude: 11.0264,
        longitude: 76.9452,
        status: 'Approved'
      },
      {
        name: 'NG Hospital',
        description: 'Committed to delivering outstanding diagnostic capabilities and healthcare at affordable fees in Singanallur.',
        address: '155A, Trichy Road, Singanallur',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641005',
        phone: '+91 422 259 5959',
        email: 'info@nghospital.com',
        emergencyContact: '+91 422 259 5108',
        openingHours: '24 Hours',
        departments: ['General Medicine', 'Gynecology', 'Urology'],
        rating: 4.4,
        latitude: 11.0028,
        longitude: 77.0123,
        status: 'Approved'
      }
    ];

    const seededHospitals = await Hospital.bulkCreate(hospitalsData);
    console.log(`${seededHospitals.length} hospitals seeded.`);

    const hospMap = {};
    seededHospitals.forEach(h => {
      hospMap[h.name] = h.id;
    });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'Admin',
      phone: '+91 98765 43210',
      gender: 'Other',
      avatar: ''
    });
    console.log('Admin account created (admin@hospital.com / admin123).');

    const patientUser = await User.create({
      name: 'Tharanish Kumar',
      email: 'patient@hospital.com',
      password: 'patient123',
      role: 'Patient',
      phone: '+91 99887 76655',
      gender: 'Male',
      avatar: ''
    });

    await Patient.create({
      userId: patientUser.id,
      dateOfBirth: new Date('1998-08-12'),
      bloodGroup: 'B+',
      address: '22, Race Course Road, Coimbatore',
      allergies: ['Dust'],
      medicalHistory: ['Lactose intolerance']
    });
    console.log('Patient account created (patient@hospital.com / patient123).');

    const doctorsData = [
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@hospital.com',
        password: 'doctor123',
        phone: '+91 91112 22333',
        gender: 'Male',
        specialization: 'Interventional Cardiology',
        department: 'Cardiology',
        hospitalName: 'PSG Hospitals',
        experience: 16,
        fees: 600,
        qualifications: ['MBBS - Madras Medical College', 'MD (Gen Medicine)', 'DM (Cardiology)'],
        biography: 'Dr. Rajesh Kumar is a leading cardiologist in Coimbatore, with extensive training in coronary angioplasty, pacemaker implantations, and pediatric cardiac interventions.',
        languages: ['Tamil', 'English', 'Hindi'],
        availability: [
          { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
          { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
          { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM'] }
        ]
      },
      {
        name: 'Dr. Anitha Subramaniam',
        email: 'anitha.s@hospital.com',
        password: 'doctor123',
        phone: '+91 92223 33444',
        gender: 'Female',
        specialization: 'High-risk Obstetrics & Laparoscopy',
        department: 'Gynecology',
        hospitalName: 'G. Kuppuswamy Naidu Memorial Hospital (GKNM)',
        experience: 14,
        fees: 500,
        qualifications: ['MBBS - Stanley Medical College', 'MD (Obstetrics & Gynecology)', 'DGO'],
        biography: 'Dr. Anitha Subramaniam has over 14 years of experience guiding mothers through complicated deliveries, vaginal birth after cesarean, and minimally invasive surgeries.',
        languages: ['Tamil', 'English', 'Malayalam'],
        availability: [
          { day: 'Tuesday', slots: ['10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '04:00 PM'] },
          { day: 'Thursday', slots: ['10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '04:00 PM'] }
        ]
      },
      {
        name: 'Dr. Suresh Chandran',
        email: 'suresh.c@hospital.com',
        password: 'doctor123',
        phone: '+91 93334 44555',
        gender: 'Male',
        specialization: 'Neurological Disorders & Stroke Management',
        department: 'Neurology',
        hospitalName: 'KMCH (Kovai Medical Center and Hospital)',
        experience: 18,
        fees: 800,
        qualifications: ['MBBS', 'MD (Neurology)', 'DM (Neurology) - NIMHANS'],
        biography: 'Dr. Suresh Chandran completed his DM from NIMHANS Bangalore and specializes in stroke thrombolysis, epilepsy care, headache disorders, and neurological rehabilitation.',
        languages: ['Tamil', 'English', 'Kannada'],
        availability: [
          { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
          { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
          { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] }
        ]
      },
      {
        name: 'Dr. Karthik Rajan',
        email: 'karthik.rajan@hospital.com',
        password: 'doctor123',
        phone: '+91 94445 55666',
        gender: 'Male',
        specialization: 'Joint Replacement & Spine Surgery',
        department: 'Orthopaedics',
        hospitalName: 'Royal Care Super Speciality Hospital',
        experience: 12,
        fees: 700,
        qualifications: ['MBBS', 'MS (Orthopaedics)', 'MCh (Orthopaedics)'],
        biography: 'Dr. Karthik Rajan is a skilled orthopedic surgeon focusing on robotic-assisted hip/knee replacements, complex fracture management, and sports medicine.',
        languages: ['Tamil', 'English'],
        availability: [
          { day: 'Wednesday', slots: ['10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM', '04:00 PM'] },
          { day: 'Friday', slots: ['10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM', '04:00 PM'] }
        ]
      },
      {
        name: 'Dr. Deepa Lakshmi',
        email: 'deepa.l@hospital.com',
        password: 'doctor123',
        phone: '+91 95556 66777',
        gender: 'Female',
        specialization: 'Neonatal & Pediatric Critical Care',
        department: 'Pediatrics',
        hospitalName: 'Sri Ramakrishna Hospital',
        experience: 10,
        fees: 400,
        qualifications: ['MBBS', 'MD (Pediatrics)', 'DCH'],
        biography: 'Dr. Deepa Lakshmi is dedicated to providing friendly, high-quality pediatric primary care and managing critical neonatal conditions in infants and young children.',
        languages: ['Tamil', 'English', 'Telugu'],
        availability: [
          { day: 'Monday', slots: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'] },
          { day: 'Wednesday', slots: ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'] },
          { day: 'Thursday', slots: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'] }
        ]
      },
      {
        name: 'Dr. Vikram Dev',
        email: 'vikram.dev@hospital.com',
        password: 'doctor123',
        phone: '+91 96667 77888',
        gender: 'Male',
        specialization: 'Surgical Oncology & Tumor Resections',
        department: 'Oncology',
        hospitalName: 'Kauvery Hospital Coimbatore',
        experience: 15,
        fees: 900,
        qualifications: ['MBBS', 'MS (General Surgery)', 'MCh (Surgical Oncology)'],
        biography: 'Dr. Vikram Dev leads surgical oncology programs. He has expertise in minimally invasive tumor resections, breast oncoplastic procedures, and gastrointestinal cancers.',
        languages: ['Tamil', 'English', 'Malayalam'],
        availability: [
          { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
          { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] }
        ]
      },
      {
        name: 'Dr. Meena Krishnan',
        email: 'meena.k@hospital.com',
        password: 'doctor123',
        phone: '+91 97778 88999',
        gender: 'Female',
        specialization: 'Clinical Dermatology & Laser Therapy',
        department: 'Dermatology',
        hospitalName: 'Sree Abirami Hospitals',
        experience: 9,
        fees: 500,
        qualifications: ['MBBS', 'MD (Dermatology, Venereology & Leprosy)'],
        biography: 'Dr. Meena Krishnan is specialized in skin rejuvenation, laser therapy, acne scar treatments, and dermatological diagnostic biopsies.',
        languages: ['Tamil', 'English'],
        availability: [
          { day: 'Monday', slots: ['10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM'] },
          { day: 'Friday', slots: ['10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM'] }
        ]
      },
      {
        name: 'Dr. Hariharan Swamy',
        email: 'hariharan.s@hospital.com',
        password: 'doctor123',
        phone: '+91 98889 99000',
        gender: 'Male',
        specialization: 'Therapeutic Endoscopy & Liver Care',
        department: 'Gastroenterology',
        hospitalName: 'Ashwin Hospital',
        experience: 13,
        fees: 600,
        qualifications: ['MBBS', 'MD (General Medicine)', 'DM (Gastroenterology)'],
        biography: 'Dr. Hariharan Swamy focuses on clinical digestive wellness, performing endoscopic ultrasound interventions, ERCP, and managing chronic liver failure.',
        languages: ['Tamil', 'English', 'Kannada'],
        availability: [
          { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM'] },
          { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM'] }
        ]
      },
      {
        name: 'Dr. Shalini Prasad',
        email: 'shalini.p@hospital.com',
        password: 'doctor123',
        phone: '+91 99990 00111',
        gender: 'Female',
        specialization: 'Family Medicine & Diabetes Care',
        department: 'General Medicine',
        hospitalName: 'NG Hospital',
        experience: 11,
        fees: 400,
        qualifications: ['MBBS', 'MD (General Medicine)'],
        biography: 'Dr. Shalini Prasad provides general health counseling, comprehensive management of hypertension, diabetes, and infectious disease diagnostics.',
        languages: ['Tamil', 'English', 'Hindi'],
        availability: [
          { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
          { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
          { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
          { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
          { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] }
        ]
      }
    ];

    for (const doc of doctorsData) {
      const u = await User.create({
        name: doc.name,
        email: doc.email,
        password: doc.password,
        role: 'Doctor',
        phone: doc.phone,
        gender: doc.gender,
        avatar: ''
      });

      await Doctor.create({
        userId: u.id,
        specialization: doc.specialization,
        departmentId: deptMap[doc.department],
        hospitalId: hospMap[doc.hospitalName],
        experience: doc.experience,
        fees: doc.fees,
        qualifications: doc.qualifications,
        biography: doc.biography,
        languages: doc.languages,
        availability: doc.availability,
        status: 'Active'
      });
      console.log(`Doctor created: ${doc.name} (${doc.email} / doctor123).`);
    }

    console.log('Database Seeding Successful!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
