// src/services/teacher-request.service.js
// Service riêng cho teacher request (từ nhánh restore-profile-update)
const { teacherrequests } = require('../models');
const { users } = require('../models');

class TeacherRequestService {
    async apply(userid, data) {
        const transaction = await users.sequelize.transaction();
        try {
            const application = await teacherrequests.create(
                {
                    userid: userid,
                    requestdetails: data.requestdetails, // Giữ nguyên như text
                    experience: data.experience,
                    specialization: data.specialization, // Sẽ là categoryId
                    certificateurl: data.certificateurl || '',
                },
                { transaction }
            );
            await transaction.commit();
            return application;
        } catch (error) {
            await transaction.rollback();
            throw new Error(`Failed to apply as teacher: ${error.message}`);
        }
    }

    async getRequestsByUser(userid) {
        return await teacherrequests.findAll({
            where: { userid },
        });
    }
}

module.exports = new TeacherRequestService();

