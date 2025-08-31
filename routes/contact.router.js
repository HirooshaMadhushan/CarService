const express = require('express');
const router = express.Router();
const { createContact, updateContactStatus, getAllContacts, getContactById,deleteContact } = require('../controllers/contact.controller');

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contact form message management
 */

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Create a new contact message
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               phone:
 *                 type: string
 *                 example: "+94123456789"
 *               subject:
 *                 type: string
 *                 example: Service inquiry
 *               message:
 *                 type: string
 *                 example: I’d like to know more about your car service packages.
 *     responses:
 *       201:
 *         description: Contact message saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contact message saved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       500:
 *         description: Server error
 */
router.post('/', createContact);

/**
 * @swagger
 * /contacts/{id}/status:
 *   patch:
 *     summary: Update the status of a contact message
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [unread, read, replied]
 *                 example: read
 *     responses:
 *       200:
 *         description: Contact status updated successfully
 *       404:
 *         description: Contact entry not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', updateContactStatus);

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Get all contact messages
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: List of all contact messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contacts retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 *       500:
 *         description: Server error
 */
router.get('/', getAllContacts);

/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     summary: Get a contact message by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contact entry retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact entry not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getContactById);
router.delete('/:id', deleteContact);

module.exports = router;
