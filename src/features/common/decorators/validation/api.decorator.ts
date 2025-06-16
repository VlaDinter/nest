import {
  ApiParam,
  ApiOperation,
  ApiBasicAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function Api(
  summary: string,
  withParam: boolean = false,
  withBasicAuth: boolean = false,
  withBearerAuth: boolean = false,
) {
  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [];

  if (withParam) {
    decorators.push(ApiParam({ name: 'id', type: 'string' }));
  }

  if (withBasicAuth) {
    decorators.push(ApiBasicAuth('basicAuth'));
  }

  if (withBearerAuth) {
    decorators.push(ApiBearerAuth());
  }

  return applyDecorators(ApiOperation({ summary }), ...decorators);
}
