import { ApiCreateAndConflict } from 'src/common/decorators/swagger.decorators';
import { ROLES } from 'src/common/types/roles.types';
import { ProtectedUserResponseDto } from 'src/users/dto/protected-user-response.dto';

export const ApiCreateEmployeeResource = () =>
	ApiCreateAndConflict({
		description: `must be a ${ROLES.ADMIN.toUpperCase()} or ${ROLES.MANAGER.toUpperCase()}`,
		type: ProtectedUserResponseDto,
	});
