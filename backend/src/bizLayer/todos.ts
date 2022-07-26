import 'source-map-support/register'


import { TodosAccess } from '../dataLayer/todosAccess'
import { TodosStorage } from '../dataLayer/TodosStorage'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { createLogger } from '../utils/logger'

const todosAccess = new TodosAccess()
const todosStorage = new TodosStorage()
const logger = createLogger('businessLogic/todos')

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info(`---------- Retrieve all todos for user with ID: ${userId} ----------`, { userId })

  return await todosAccess.getAllTodos(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  const todoId = uuid.v4()

  const newItem: TodoItem = {
    userId,
    todoId,
    done: false,
    attachmentUrl: null,
    createdAt: new Date().toISOString(),
    ...createTodoRequest
  }

  logger.info(`---------- Create todo with ID: ${todoId} for user with ID: ${userId} ----------`, { userId, todoId, todoItem: newItem })

  await todosAccess.createTodo(newItem)

  return newItem
}

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {
  logger.info(`---------- Update todo with ID: ${todoId} for user with ID: ${userId} ----------`, { userId, todoId, todoUpdate: updateTodoRequest })

  await todosAccess.updateTodo(todoId, updateTodoRequest as TodoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info(`---------- Delete todo with ID: ${todoId} for user with ID: ${userId} ----------`, { userId, todoId })

  await todosAccess.deleteTodo(todoId)
}

export async function updateImageUrl(todoId: string, imageId: string) {
  logger.info(`---------- Generate attachment URL for attachment with ID: ${imageId} ----------`)

  const imageUrl = await todosStorage.getAttachmentUrl(imageId)

  await todosAccess.updateImageUrl(todoId, imageUrl)
}

export async function generateUploadUrl(attachmentId: string): Promise<string> {
  logger.info(`---------- Generate upload URL for attachment with ID: ${attachmentId} ----------`)

  const uploadUrl = await todosStorage.getUploadUrl(attachmentId)

  return uploadUrl
}