
const express = require('express');
const oracledb = require('oracledb');
const { getConnection } = require('../db');
const { verifyFirebaseToken } = require('../firebaseAuth');
const { requireAdmin } = require('../adminAuth');

const router = express.Router();

// CUSTOMER: Submit a contact enquiry
router.post('/', async (req, res) => {
  const { fullName, email, subject, message } = req.body || {};

  if (
    typeof fullName !== 'string' ||
    typeof email !== 'string' ||
    typeof subject !== 'string' ||
    typeof message !== 'string' ||
    !fullName.trim() ||
    !email.trim() ||
    !subject.trim() ||
    !message.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please complete all contact form fields.',
    });
  }

  const cleanName = fullName.trim();
  const cleanEmail = email.trim();
  const cleanSubject = subject.trim();
  const cleanMessage = message.trim();

  if (
    cleanName.length > 100 ||
    cleanEmail.length > 150 ||
    cleanSubject.length > 100 ||
    cleanMessage.length > 2000 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please check your details and try again.',
    });
  }

  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `INSERT INTO CONTACT_ENQUIRIES
         (FULL_NAME, EMAIL, SUBJECT, MESSAGE)
       VALUES
         (:fullName, :email, :subject, :message)`,
      {
        fullName: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been submitted successfully.',
    });
  } catch (error) {
    console.error('Contact enquiry save failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'We could not submit your enquiry. Please try again.',
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Contact connection close failed:', error.message);
      }
    }
  }
});

// ADMIN: View all customer enquiries
router.get('/admin', requireAdmin, async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ENQUIRY_ID,
         FULL_NAME,
         EMAIL,
         SUBJECT,
         MESSAGE,
         STATUS,
         CREATED_AT,
         ADMIN_REPLY,
         REPLIED_AT,
         REPLIED_BY
       FROM CONTACT_ENQUIRIES
       ORDER BY CREATED_AT DESC`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.json({
      success: true,
      enquiries: result.rows,
    });
  } catch (error) {
    console.error('Admin enquiry retrieval failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to load customer enquiries.',
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Contact connection close failed:', error.message);
      }
    }
  }
});

// ADMIN: Reply to a customer enquiry
router.patch('/admin/:id/reply', requireAdmin, async (req, res) => {
  const enquiryId = Number(req.params.id);
  const { reply } = req.body || {};

  if (
    !Number.isInteger(enquiryId) ||
    enquiryId < 1 ||
    typeof reply !== 'string' ||
    !reply.trim() ||
    reply.trim().length > 2000
  ) {
    return res.status(400).json({
      success: false,
      message: 'Provide a valid enquiry ID and reply (1–2000 characters).',
    });
  }

  const adminEmail =
    req.user?.email ||
    req.admin?.email ||
    'SpiceNest Administrator';

  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE CONTACT_ENQUIRIES
       SET ADMIN_REPLY = :reply,
           REPLIED_AT = CURRENT_TIMESTAMP,
           REPLIED_BY = :repliedBy,
           STATUS = 'REPLIED'
       WHERE ENQUIRY_ID = :enquiryId`,
      {
        reply: reply.trim(),
        repliedBy: adminEmail,
        enquiryId,
      },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Reply saved successfully.',
    });
  } catch (error) {
    console.error('Admin enquiry reply failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to save the reply.',
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Contact connection close failed:', error.message);
      }
    }
  }
});

// CUSTOMER: View replies sent to their own email address
router.get('/my-replies', verifyFirebaseToken, async (req, res) => {
  let connection;

  try {
    // Use the identity established by Firebase token verification.
    const email = req.firebaseUser?.email;

if (req.firebaseUser?.emailVerified !== true) {
  return res.status(403).json({
    success: false,
    message: 'Please verify your email address before viewing replies.',
  });
}

    if (!email) {
      return res.status(403).json({
        success: false,
        message: 'Your signed-in account does not have a verified email.',
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ENQUIRY_ID,
         SUBJECT,
         MESSAGE,
         STATUS,
         CREATED_AT,
         ADMIN_REPLY,
         REPLIED_AT,
         REPLIED_BY
       FROM CONTACT_ENQUIRIES
       WHERE LOWER(EMAIL) = LOWER(:email)
         AND ADMIN_REPLY IS NOT NULL
       ORDER BY REPLIED_AT DESC`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.json({
      success: true,
      replies: result.rows,
    });
  } catch (error) {
    console.error('Customer reply retrieval failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to load replies.',
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Contact connection close failed:', error.message);
      }
    }
  }
});

module.exports = router;
