import { User } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';

const payload = {
    name: 'Administrator',
    email: config.SUPER_ADMIN.EMAIL,
    role: USER_ROLES.SUPER_ADMIN,
    password: config.SUPER_ADMIN.PASSWORD,
    confirmPassword: config.SUPER_ADMIN.CONFIRM_PASSWORD,
    verified: true,
};

export const seedSuperAdmin = async () => {
    const isExistSuperAdmin = await User.findOne({
        email: config.SUPER_ADMIN.EMAIL,
        role: USER_ROLES.SUPER_ADMIN,
    });
    if (!isExistSuperAdmin) {
        await User.create(payload);
        logger.info('✨ Super Admin account has been successfully created!');
    }
};
