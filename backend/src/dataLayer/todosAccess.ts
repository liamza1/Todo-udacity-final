import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'
const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('dataLayer/todosAccess')
export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.INDEX_NAME
  ) {}

  async createTodo(todoItem: TodoItem) {
    logger.info(`---------- Putting todo ${todoItem.todoId} into ${this.todosTable} table. ----------`)

    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem,
    }).promise()
  }

  /* Array of items */
  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`---------- Getting all todos for user ${userId} from ${this.todosTable} table. ----------`)

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items

    logger.info(`---------- Found ${items.length} todos for the user with ID: ${userId} in ${this.todosTable} table. ----------`)

    return items as TodoItem[]
  }

  /* Single item */
  async getTodo(todoId: string): Promise<TodoItem> {
    logger.info(`---------- Getting todo ${todoId} from ${this.todosTable} table. ----------`)

    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: {
        todoId
      }
    }).promise()

    return result.Item as TodoItem
  }

  async todoExists(todoId: string): Promise<boolean> {
    const item = await this.getTodo(todoId)
    return !!item
  }

  async updateTodo(todoId: string, todoUpdate: TodoUpdate) {
    logger.info(`---------- Update todo item with ID: ${todoId} in ${this.todosTable} table. ----------`)

    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": todoUpdate.name,
        ":dueDate": todoUpdate.dueDate,
        ":done": todoUpdate.done
      }
    }).promise()
  }

  async deleteTodo(todoId: string) {
    logger.info(`---------- Delete todo item with ID: ${todoId} from ${this.todosTable} table. ----------`)

    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId
      }
    }).promise()
  }

  async updateImageUrl(todoId: string, attachmentUrl: string) {
    logger.info(`---------- Update attachment URL for todo with ID: ${todoId} in ${this.todosTable} table. ----------`)

    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }
}