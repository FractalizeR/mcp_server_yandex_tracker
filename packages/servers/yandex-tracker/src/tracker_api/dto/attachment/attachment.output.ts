/**
 * Output DTO для одного файла (attachment)
 *
 * ВАЖНО: Используется как результат операций с attachments.
 * Содержит информацию о файле без самого файла.
 */

import type { Attachment } from '../../entities/attachment.entity.js';

/**
 * Результат получения информации о файле
 *
 * Просто re-export Attachment entity для явного обозначения Output DTO.
 */
export type AttachmentOutput = Attachment;
