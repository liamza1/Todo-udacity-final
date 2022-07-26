import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as uuid from 'uuid'
import { generateUploadUrl, updateImageUrl } from '../../bizLayer/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('generateUploadUrl event in progress....', event)

  const todoId = event.pathParameters.todoId
  const imageId = uuid.v4()
  const uploadUrl = await generateUploadUrl(imageId)
  await updateImageUrl(todoId, imageId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl,
    })
  }
}
