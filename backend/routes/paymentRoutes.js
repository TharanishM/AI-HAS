import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Bill from '../models/Bill.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid1234',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mockkeysecret1234567890',
});


router.post('/order/:billId', protect, async (req, res, next) => {
  try {
    const bill = await Bill.findByPk(req.params.billId);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const options = {
      amount: bill.amount * 100, 
      currency: 'INR',
      receipt: bill.invoiceNumber,
    };

    const order = await razorpay.orders.create(options);
    
   
    bill.razorpayOrderId = order.id;
    await bill.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid1234'
    });
  } catch (error) {
    next(error);
  }
});


router.post('/verify', protect, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billId } = req.body;

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mockkeysecret1234567890');
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Transaction verification failed' });
    }

    const bill = await Bill.findByPk(billId);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    bill.status = 'Paid';
    bill.paymentMethod = 'UPI'; 
    bill.razorpayPaymentId = razorpay_payment_id;
    bill.razorpaySignature = razorpay_signature;
    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Payment completed and verified successfully!',
      bill
    });
  } catch (error) {
    next(error);
  }
});


router.get('/history', protect, async (req, res, next) => {
  try {
    const bills = await Bill.findAll({
      where: { patientId: req.user.id },
      include: [
        { model: User, as: 'doctor', attributes: ['name'] },
        { model: Appointment, as: 'appointment', attributes: ['appointmentNumber', 'date'] }
      ],
      order: [['billingDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: bills.length, bills });
  } catch (error) {
    next(error);
  }
});

export default router;
